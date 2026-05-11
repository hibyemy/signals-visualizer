import { useState, useMemo } from 'react'
import PlotModule from 'react-plotly.js'
const Plot = PlotModule.default || PlotModule
import { linspace } from '../utils/signalMath'

const darkAxis = { zeroline: true, zerolinecolor: '#475569', zerolinewidth: 1.5, gridcolor: '#1e293b', tickfont: { color: '#64748b', size: 11 }, color: '#64748b' }
const plotCfg = { displayModeBar: false, responsive: true }

export default function ImpulseResponseVisualizer() {
  const [system, setSystem] = useState('RC Low-Pass')
  const [alpha, setAlpha] = useState(2)

  const { inputTrace, outputTrace, eqn } = useMemo(() => {
    const t = linspace(-1, 6, 600)
    const delta = t.map(ti => (Math.abs(ti) < 0.03 ? 1 / 0.06 : 0))
    let ht
    if (system === 'RC Low-Pass') ht = t.map(ti => ti >= 0 ? alpha * Math.exp(-alpha * ti) : 0)
    else if (system === 'Resonator') ht = t.map(ti => ti >= 0 ? Math.exp(-0.5 * ti) * Math.sin(alpha * ti) : 0)
    else ht = t.map(ti => ti >= 0 ? alpha * alpha * ti * Math.exp(-alpha * ti) : 0)

    return {
      inputTrace: { x: t, y: delta, type: 'scatter', mode: 'lines', name: 'δ(t) input', line: { color: '#94a3b8', width: 2, dash: 'dash' } },
      outputTrace: { x: t, y: ht, type: 'scatter', mode: 'lines', name: 'h(t) output', line: { color: '#818cf8', width: 3 } },
      eqn: system === 'RC Low-Pass' ? `h(t) = ${alpha}·e^(-${alpha}t)·u(t)` : system === 'Resonator' ? `h(t) = e^(-0.5t)·sin(${alpha}t)·u(t)` : `h(t) = ${alpha}²·t·e^(-${alpha}t)·u(t)`,
    }
  }, [system, alpha])

  const layout = {
    margin: { l: 50, r: 20, t: 28, b: 44 },
    title: { text: 'δ(t) → System → h(t)', font: { size: 14, color: '#94a3b8' } },
    xaxis: { ...darkAxis, title: { text: 't', font: { size: 12, color: '#94a3b8' } }, range: [-1, 6] },
    yaxis: { ...darkAxis },
    paper_bgcolor: '#0f172a', plot_bgcolor: '#0f172a', font: { color: '#cbd5e1' },
    showlegend: true, legend: { x: 0.5, y: 0.99, bgcolor: 'rgba(15,23,42,0.75)', bordercolor: '#334155', borderwidth: 1, font: { size: 11, color: '#94a3b8' } },
  }

  return (
    <section className="w-full min-h-screen bg-gray-950 text-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-300 to-slate-500 bg-clip-text text-transparent">Impulse Response</h2>
        <p className="mt-2 text-sm text-gray-400">Inject an impulse δ(t) and observe how the system responds — this <em>is</em> the system's fingerprint.</p>
        <p className="mt-1 text-sm text-gray-500 font-mono">{eqn}</p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-6 flex flex-col gap-6 h-fit">
          <select value={system} onChange={e => setSystem(e.target.value)} className="w-full rounded-lg bg-gray-800/80 border border-gray-700/60 text-sm text-gray-200 px-3 py-2 cursor-pointer appearance-none hover:border-gray-600">
            {['RC Low-Pass','Resonator','Critically Damped'].map(s => <option key={s}>{s}</option>)}
          </select>
          <div>
            <div className="flex justify-between mb-1"><label className="text-sm text-gray-300">α</label><span className="text-sm font-mono text-indigo-400">{alpha}</span></div>
            <input type="range" min={0.5} max={10} step={0.5} value={alpha} onChange={e => setAlpha(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-700/60 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500" />
          </div>
          <div className="text-xs text-gray-500 border-t border-gray-800 pt-4 space-y-2">
            <p><strong className="text-gray-400">Why it matters:</strong> Every LTI system is fully characterized by h(t). Output for any input x(t) = x(t) * h(t) (convolution).</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-3 sm:p-4 overflow-hidden">
          <Plot data={[inputTrace, outputTrace]} layout={layout} config={plotCfg} useResizeHandler style={{ width: '100%', height: '450px' }} />
        </div>
      </div>
    </section>
  )
}
