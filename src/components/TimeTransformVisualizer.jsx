import { useState, useMemo } from 'react'
import PlotModule from 'react-plotly.js'
const Plot = PlotModule.default || PlotModule
import {
  generateStep,
  generateRamp,
  generateImpulse,
  generateSinusoid,
} from '../utils/signalMath'

// ── generator lookup ──────────────────────────────────────────────────────
const GENERATORS = {
  Step:     generateStep,
  Ramp:     generateRamp,
  Impulse:  generateImpulse,
  Sinusoid: generateSinusoid,
}

const SIGNAL_TYPES = Object.keys(GENERATORS)

const T_MIN   = -5
const T_MAX   =  5
const SAMPLES = 500

// ── helpers ───────────────────────────────────────────────────────────────

/** Format a number with explicit sign for the equation readout. */
function fmt(n) {
  return n >= 0 ? `${n}` : `${n}`
}

/** Build the human-readable y(t) = A · x(at + b) string. */
function equationString(A, a, b) {
  const inner =
    b === 0
      ? `${fmt(a)}t`
      : b > 0
        ? `${fmt(a)}t + ${b}`
        : `${fmt(a)}t − ${Math.abs(b)}`

  return `y(t) = ${A} · x(${inner})`
}

// ── component ─────────────────────────────────────────────────────────────

export default function TimeTransformVisualizer() {
  const [signalType, setSignalType] = useState('Step')
  const [A, setA] = useState(1)
  const [a, setA_scale] = useState(1)
  const [b, setB] = useState(0)

  // Guard: never let `a` be exactly 0
  const safeA = a === 0 ? 0.5 : a

  // ── plot data (recomputed when any parameter changes) ─────────────────
  const { originalTrace, transformedTrace } = useMemo(() => {
    const gen = GENERATORS[signalType]
    const orig = gen(T_MIN, T_MAX, SAMPLES, 1, 1, 0)
    const xfrm = gen(T_MIN, T_MAX, SAMPLES, A, safeA, b)

    return {
      originalTrace: {
        x: orig.x,
        y: orig.y,
        type: 'scatter',
        mode: signalType === 'Impulse' ? 'markers' : 'lines',
        name: 'x(t)  original',
        line: { color: 'rgba(160,170,185,0.5)', width: 2, dash: 'dash' },
        marker: { color: 'rgba(160,170,185,0.55)', size: 7 },
      },
      transformedTrace: {
        x: xfrm.x,
        y: xfrm.y,
        type: 'scatter',
        mode: signalType === 'Impulse' ? 'markers' : 'lines',
        name: `y(t) = ${A}·x(${safeA}t+${b})`,
        line: { color: '#3b82f6', width: 3 },
        marker: { color: '#3b82f6', size: 10, symbol: 'diamond' },
      },
    }
  }, [signalType, A, safeA, b])

  // ── Plotly layout ─────────────────────────────────────────────────────
  const layout = {
    margin: { l: 48, r: 20, t: 20, b: 44 },
    xaxis: {
      range: [T_MIN, T_MAX],
      title: { text: 't', font: { size: 13, color: '#94a3b8' } },
      zeroline: true,
      zerolinecolor: '#475569',
      zerolinewidth: 1.5,
      gridcolor: '#1e293b',
      tickfont: { color: '#64748b', size: 11 },
      color: '#64748b',
    },
    yaxis: {
      range: [-5, 5],
      title: { text: 'y(t)', font: { size: 13, color: '#94a3b8' } },
      zeroline: true,
      zerolinecolor: '#475569',
      zerolinewidth: 1.5,
      gridcolor: '#1e293b',
      tickfont: { color: '#64748b', size: 11 },
      color: '#64748b',
    },
    paper_bgcolor: '#0f172a',
    plot_bgcolor: '#0f172a',
    font: { color: '#cbd5e1' },
    legend: {
      x: 0.01,
      y: 0.99,
      bgcolor: 'rgba(15,23,42,0.75)',
      bordercolor: '#334155',
      borderwidth: 1,
      font: { size: 11, color: '#94a3b8' },
    },
    showlegend: true,
  }

  const plotConfig = {
    displayModeBar: false,
    responsive: true,
  }

  // ── slider helper ─────────────────────────────────────────────────────
  const Slider = ({ label, value, setValue, min, max, step, unit = '' }) => (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm font-mono font-semibold text-blue-400 tabular-nums min-w-[3ch] text-right">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer
                   bg-gray-700/60
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-blue-500
                   [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(59,130,246,0.5)]
                   [&::-webkit-slider-thumb]:transition-shadow
                   [&::-webkit-slider-thumb]:hover:shadow-[0_0_14px_rgba(59,130,246,0.7)]
                   [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                   [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500
                   [&::-moz-range-thumb]:border-0"
      />
      <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  )

  // ── render ────────────────────────────────────────────────────────────
  return (
    <section className="w-full min-h-screen bg-gray-950 text-white px-4 py-8 sm:px-6 lg:px-10">
      {/* ── header ──────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Time Domain Transformations
        </h2>
        <p className="mt-2 text-base sm:text-lg text-gray-400 font-mono tracking-wide">
          {equationString(A, safeA, b)}
        </p>
      </div>

      {/* ── two-column grid ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        {/* ── controls ────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-6 flex flex-col gap-6 h-fit">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
            Parameters
          </h3>

          {/* Signal selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Signal Type
            </label>
            <select
              value={signalType}
              onChange={(e) => setSignalType(e.target.value)}
              className="w-full rounded-lg bg-gray-800/80 border border-gray-700/60 text-sm text-gray-200
                         px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                         transition-colors cursor-pointer appearance-none
                         hover:border-gray-600"
            >
              {SIGNAL_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Amplitude */}
          <Slider label="A  (Amplitude)" value={A} setValue={setA} min={-3} max={3} step={0.5} />

          {/* Time scale */}
          <Slider
            label="a  (Time Scale)"
            value={a}
            setValue={(v) => setA_scale(v === 0 ? 0.5 : v)}
            min={-3}
            max={3}
            step={0.5}
          />

          {/* Time shift */}
          <Slider label="b  (Time Shift)" value={b} setValue={setB} min={-5} max={5} step={1} />

          {/* Reset */}
          <button
            onClick={() => { setA(1); setA_scale(1); setB(0); setSignalType('Step') }}
            className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700/50 text-sm text-gray-400
                       py-2 hover:bg-gray-700 hover:text-gray-200 transition-colors"
          >
            Reset defaults
          </button>
        </div>

        {/* ── plot ────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-3 sm:p-4 overflow-hidden">
          <Plot
            data={[originalTrace, transformedTrace]}
            layout={layout}
            config={plotConfig}
            useResizeHandler
            className="w-full"
            style={{ width: '100%', height: '480px' }}
          />
        </div>
      </div>
    </section>
  )
}
