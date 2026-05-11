import { useState, useMemo } from 'react'
import PlotModule from 'react-plotly.js'
const Plot = PlotModule.default || PlotModule
import { linspace, generateExponentialDecay, generateDampedSinusoid } from '../utils/signalMath'

const SYSTEMS = {
  'First-Order': { desc: 'H(s) = 1 / (s + α)', params: ['alpha'] },
  'Second-Order Underdamped': { desc: 'ζ < 1 — oscillatory decay', params: ['zeta', 'wn'] },
  'Second-Order Critically': { desc: 'ζ = 1 — fastest non-oscillatory', params: ['wn'] },
  'Second-Order Overdamped': { desc: 'ζ > 1 — sluggish decay', params: ['zeta', 'wn'] },
}

const darkAxis = {
  zeroline: true, zerolinecolor: '#475569', zerolinewidth: 1.5,
  gridcolor: '#1e293b', tickfont: { color: '#64748b', size: 11 }, color: '#64748b',
}
const plotConfig = { displayModeBar: false, responsive: true }

export default function LaplaceVisualizer() {
  const [system, setSystem] = useState('First-Order')
  const [alpha, setAlpha] = useState(2)
  const [zeta, setZeta] = useState(0.3)
  const [wn, setWn] = useState(5)

  const { poleTrace, zeroTrace, impulseTrace, axisCircle, eqn } = useMemo(() => {
    const T = linspace(0, 6, 600)
    let poles = [], zeros = [], hT = []

    if (system === 'First-Order') {
      poles = [{ re: -alpha, im: 0 }]
      hT = T.map(t => Math.exp(-alpha * t))
    } else if (system === 'Second-Order Underdamped') {
      const sigma = zeta * wn
      const wd = wn * Math.sqrt(1 - zeta * zeta)
      poles = [{ re: -sigma, im: wd }, { re: -sigma, im: -wd }]
      hT = T.map(t => (wn * wn / wd) * Math.exp(-sigma * t) * Math.sin(wd * t))
    } else if (system === 'Second-Order Critically') {
      poles = [{ re: -wn, im: 0 }, { re: -wn, im: 0.001 }]
      hT = T.map(t => wn * wn * t * Math.exp(-wn * t))
    } else {
      const s1 = -wn * (zeta - Math.sqrt(zeta * zeta - 1))
      const s2 = -wn * (zeta + Math.sqrt(zeta * zeta - 1))
      poles = [{ re: s1, im: 0 }, { re: s2, im: 0 }]
      hT = T.map(t => (s1 === s2) ? 0 : (wn * wn / (s1 - s2)) * (Math.exp(s1 * t) - Math.exp(s2 * t)))
    }

    return {
      poleTrace: {
        x: poles.map(p => p.re), y: poles.map(p => p.im),
        type: 'scatter', mode: 'markers', name: 'Poles',
        marker: { symbol: 'x', size: 14, color: '#ef4444', line: { width: 3, color: '#ef4444' } },
      },
      zeroTrace: {
        x: zeros.map(z => z.re), y: zeros.map(z => z.im),
        type: 'scatter', mode: 'markers', name: 'Zeros',
        marker: { symbol: 'circle-open', size: 14, color: '#22d3ee', line: { width: 3 } },
      },
      impulseTrace: {
        x: T, y: hT, type: 'scatter', mode: 'lines', name: 'h(t)',
        line: { color: '#a78bfa', width: 3 },
      },
      axisCircle: null,
      eqn: system === 'First-Order'
        ? `H(s) = 1 / (s + ${alpha})`
        : `H(s) = ωn² / (s² + 2ζωn·s + ωn²)   ζ=${zeta}, ωn=${wn}`,
    }
  }, [system, alpha, zeta, wn])

  const sPlaneLayout = {
    margin: { l: 48, r: 20, t: 28, b: 44 },
    title: { text: 's-Plane (Poles & Zeros)', font: { size: 14, color: '#94a3b8' } },
    xaxis: { ...darkAxis, title: { text: 'Real (σ)', font: { size: 12, color: '#94a3b8' } }, range: [-12, 2] },
    yaxis: { ...darkAxis, title: { text: 'Imag (jω)', font: { size: 12, color: '#94a3b8' } }, range: [-10, 10], scaleanchor: 'x' },
    paper_bgcolor: '#0f172a', plot_bgcolor: '#0f172a', font: { color: '#cbd5e1' },
    showlegend: true,
    legend: { x: 0.01, y: 0.99, bgcolor: 'rgba(15,23,42,0.75)', bordercolor: '#334155', borderwidth: 1, font: { size: 11, color: '#94a3b8' } },
    shapes: [{ type: 'line', x0: 0, x1: 0, y0: -10, y1: 10, line: { color: '#f59e0b44', width: 2, dash: 'dot' } }],
  }

  const hLayout = {
    margin: { l: 48, r: 20, t: 28, b: 44 },
    title: { text: 'Impulse Response h(t)', font: { size: 14, color: '#94a3b8' } },
    xaxis: { ...darkAxis, title: { text: 't', font: { size: 12, color: '#94a3b8' } }, range: [0, 6] },
    yaxis: { ...darkAxis, title: { text: 'h(t)', font: { size: 12, color: '#94a3b8' } } },
    paper_bgcolor: '#0f172a', plot_bgcolor: '#0f172a', font: { color: '#cbd5e1' }, showlegend: false,
  }

  const Slider = ({ label, value, setValue, min, max, step }) => (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm font-mono font-semibold text-violet-400 tabular-nums">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => setValue(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-700/60
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500
          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
    </div>
  )

  return (
    <section className="w-full min-h-screen bg-gray-950 text-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
          Laplace Domain (s-Plane)
        </h2>
        <p className="mt-2 text-base text-gray-400 font-mono tracking-wide">{eqn}</p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-6 flex flex-col gap-6 h-fit">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">System Type</h3>
          <select value={system} onChange={e => setSystem(e.target.value)}
            className="w-full rounded-lg bg-gray-800/80 border border-gray-700/60 text-sm text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer appearance-none hover:border-gray-600">
            {Object.entries(SYSTEMS).map(([k, v]) => <option key={k} value={k}>{k} — {v.desc}</option>)}
          </select>
          {system === 'First-Order' && <Slider label="α (Pole position)" value={alpha} setValue={setAlpha} min={0.5} max={10} step={0.5} />}
          {system !== 'First-Order' && system !== 'Second-Order Critically' && (
            <Slider label="ζ (Damping ratio)" value={zeta} setValue={setZeta}
              min={system === 'Second-Order Underdamped' ? 0.05 : 1.05} max={system === 'Second-Order Underdamped' ? 0.95 : 3} step={0.05} />
          )}
          {system !== 'First-Order' && <Slider label="ωn (Natural freq)" value={wn} setValue={setWn} min={1} max={15} step={0.5} />}
          <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-800 pt-4">
            <p><strong className="text-gray-400">Stability rule:</strong> All poles must be in the left half-plane (Re &lt; 0) for a causal, stable system.</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-3 sm:p-4 flex flex-col gap-4 overflow-hidden">
          <Plot data={[poleTrace, zeroTrace]} layout={sPlaneLayout} config={plotConfig} useResizeHandler style={{ width: '100%', height: '320px' }} />
          <Plot data={[impulseTrace]} layout={hLayout} config={plotConfig} useResizeHandler style={{ width: '100%', height: '280px' }} />
        </div>
      </div>
    </section>
  )
}
