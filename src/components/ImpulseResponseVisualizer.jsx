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

      {/* Educational Content */}
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            Core Formula
          </h3>
          <p className="text-sm text-gray-200 leading-relaxed font-mono bg-gray-950 p-3 rounded-lg border border-gray-800 mb-4 text-center shadow-inner">
            y(t) = x(t) * h(t)
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            An impulse <span className="font-mono text-gray-300">\delta(t)</span> is a theoretical infinitely sharp pulse containing all frequencies. The system's output to this pulse is <span className="font-mono text-gray-300">h(t)</span>. Via <strong className="text-gray-300">convolution (*)</strong>, any input can be processed.
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Applications & Usage
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Used heavily in acoustics and audio engineering. You can record the echo in a cathedral (the impulse response), and convolve that recording with dry vocals to make them sound like they were sung there.
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            When to use it
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Best for defining exactly how a Linear Time-Invariant (LTI) system behaves purely in the time domain. It contains the entire "DNA" of the system in a single transient waveform.
          </p>
        </div>
      </div>
    </section>
  )
}
