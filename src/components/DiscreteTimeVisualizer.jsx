import { useState, useMemo } from 'react'
import PlotModule from 'react-plotly.js'
const Plot = PlotModule.default || PlotModule
import { linspace } from '../utils/signalMath'

const darkAxis = {
  zeroline: true, zerolinecolor: '#475569', zerolinewidth: 1.5,
  gridcolor: '#1e293b', tickfont: { color: '#64748b', size: 11 }, color: '#64748b',
}
const plotCfg = { displayModeBar: false, responsive: true }

export default function DiscreteTimeVisualizer() {
  const [signal, setSignal] = useState('Sinusoid')
  const [Ts, setTs] = useState(0.5)
  const [fSig, setFsig] = useState(1)

  const { contTrace, sampleTrace, stemTrace, aliasWarning } = useMemo(() => {
    const tC = linspace(-5, 5, 1000)
    let yC
    if (signal === 'Sinusoid') yC = tC.map(t => Math.sin(2 * Math.PI * fSig * t))
    else if (signal === 'Exponential Decay') yC = tC.map(t => t >= 0 ? Math.exp(-t) : 0)
    else yC = tC.map(t => t >= 0 ? 1 : 0)

    const nSamples = []
    const ySamples = []
    for (let t = -5; t <= 5; t += Ts) {
      nSamples.push(t)
      if (signal === 'Sinusoid') ySamples.push(Math.sin(2 * Math.PI * fSig * t))
      else if (signal === 'Exponential Decay') ySamples.push(t >= 0 ? Math.exp(-t) : 0)
      else ySamples.push(t >= 0 ? 1 : 0)
    }

    const fNyquist = 1 / (2 * Ts)
    const alias = signal === 'Sinusoid' && fSig > fNyquist

    return {
      contTrace: { x: tC, y: yC, type: 'scatter', mode: 'lines', name: 'x(t)', line: { color: 'rgba(160,170,185,0.4)', width: 2, dash: 'dash' } },
      sampleTrace: { x: nSamples, y: ySamples, type: 'scatter', mode: 'markers', name: 'Samples', marker: { color: '#10b981', size: 8 } },
      stemTrace: { x: nSamples, y: ySamples, type: 'bar', name: 'x[n]', marker: { color: '#34d399' }, width: Ts * 0.08 },
      aliasWarning: alias,
    }
  }, [signal, Ts, fSig])

  const mkLayout = (title, xLbl) => ({
    margin: { l: 50, r: 20, t: 32, b: 44 },
    title: { text: title, font: { size: 14, color: '#94a3b8' } },
    xaxis: { ...darkAxis, title: { text: xLbl, font: { size: 12, color: '#94a3b8' } }, range: [-5, 5] },
    yaxis: { ...darkAxis, range: [-1.5, 1.5] },
    paper_bgcolor: '#0f172a', plot_bgcolor: '#0f172a', font: { color: '#cbd5e1' }, showlegend: true,
    legend: { x: 0.01, y: 0.99, bgcolor: 'rgba(15,23,42,0.75)', bordercolor: '#334155', borderwidth: 1, font: { size: 11, color: '#94a3b8' } },
  })

  const Slider = ({ label, value, setValue, min, max, step }) => (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm font-mono font-semibold text-emerald-400 tabular-nums">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => setValue(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-700/60
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500
          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
    </div>
  )

  return (
    <section className="w-full min-h-screen bg-gray-950 text-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
          Discrete-Time Domain (n)
        </h2>
        <p className="mt-2 text-sm text-gray-400 font-mono">x[n] = x(nTs) — Sampling a continuous signal</p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-6 flex flex-col gap-6 h-fit">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Parameters</h3>
          <select value={signal} onChange={e => setSignal(e.target.value)}
            className="w-full rounded-lg bg-gray-800/80 border border-gray-700/60 text-sm text-gray-200 px-3 py-2 cursor-pointer appearance-none hover:border-gray-600">
            {['Sinusoid','Exponential Decay','Unit Step'].map(s => <option key={s}>{s}</option>)}
          </select>
          <Slider label="Ts (Sample period)" value={Ts} setValue={setTs} min={0.1} max={2} step={0.1} />
          {signal === 'Sinusoid' && <Slider label="Signal freq (Hz)" value={fSig} setValue={setFsig} min={0.5} max={5} step={0.25} />}
          <div className="text-xs leading-relaxed border-t border-gray-800 pt-4 space-y-1">
            <p className="text-gray-500"><strong className="text-gray-400">Nyquist freq:</strong> {(1/(2*Ts)).toFixed(2)} Hz</p>
            {aliasWarning && <p className="text-amber-400 font-semibold">⚠ Aliasing! Signal freq exceeds Nyquist limit.</p>}
            {!aliasWarning && signal === 'Sinusoid' && <p className="text-emerald-400">✓ No aliasing — signal safely sampled.</p>}
          </div>
        </div>
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-3 sm:p-4 flex flex-col gap-4 overflow-hidden">
          <Plot data={[contTrace, sampleTrace]} layout={mkLayout('Continuous + Sample Points', 't (seconds)')} config={plotCfg} useResizeHandler style={{ width: '100%', height: '300px' }} />
          <Plot data={[stemTrace]} layout={{ ...mkLayout('Discrete Sequence x[n]', 'n (sample index)'), bargap: 0.8 }} config={plotCfg} useResizeHandler style={{ width: '100%', height: '300px' }} />
        </div>
      </div>
    </section>
  )
}
