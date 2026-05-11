import { useState, useMemo } from 'react'
import PlotModule from 'react-plotly.js'
const Plot = PlotModule.default || PlotModule
import { linspace } from '../utils/signalMath'

const darkAxis = { zeroline: true, zerolinecolor: '#475569', zerolinewidth: 1.5, gridcolor: '#1e293b', tickfont: { color: '#64748b', size: 11 }, color: '#64748b' }
const plotCfg = { displayModeBar: false, responsive: true }

export default function TransferFunctionVisualizer() {
  const [inputType, setInputType] = useState('Step')
  const [alpha, setAlpha] = useState(2)

  const { inputTrace, outputTrace, tfTrace } = useMemo(() => {
    const t = linspace(-1, 8, 800)
    let xt, yt
    if (inputType === 'Step') {
      xt = t.map(ti => ti >= 0 ? 1 : 0)
      yt = t.map(ti => ti >= 0 ? 1 - Math.exp(-alpha * ti) : 0)
    } else if (inputType === 'Ramp') {
      xt = t.map(ti => ti >= 0 ? ti : 0)
      yt = t.map(ti => ti >= 0 ? ti / alpha - (1 - Math.exp(-alpha * ti)) / (alpha * alpha) : 0)
    } else {
      xt = t.map(ti => Math.sin(2 * ti))
      const w = 2
      const mag = 1 / Math.sqrt(alpha * alpha + w * w)
      const phase = -Math.atan2(w, alpha)
      yt = t.map(ti => ti >= 0 ? mag * alpha * Math.sin(w * ti + phase) + mag * w * Math.exp(-alpha * ti) : 0)
    }

    const sReal = linspace(-10, 2, 200)
    const tfMag = sReal.map(s => 1 / Math.sqrt(s * s + alpha * alpha))

    return {
      inputTrace: { x: t, y: xt, type: 'scatter', mode: 'lines', name: 'x(t) input', line: { color: '#94a3b8', width: 2, dash: 'dash' } },
      outputTrace: { x: t, y: yt, type: 'scatter', mode: 'lines', name: 'y(t) output', line: { color: '#818cf8', width: 3 } },
      tfTrace: { x: sReal, y: tfMag, type: 'scatter', mode: 'lines', name: '|H(σ)|', line: { color: '#a78bfa', width: 2.5 } },
    }
  }, [inputType, alpha])

  const mkLayout = (title, xLbl) => ({
    margin: { l: 50, r: 20, t: 28, b: 44 },
    title: { text: title, font: { size: 14, color: '#94a3b8' } },
    xaxis: { ...darkAxis, title: { text: xLbl, font: { size: 12, color: '#94a3b8' } } },
    yaxis: { ...darkAxis },
    paper_bgcolor: '#0f172a', plot_bgcolor: '#0f172a', font: { color: '#cbd5e1' },
    showlegend: true, legend: { x: 0.5, y: 0.99, bgcolor: 'rgba(15,23,42,0.75)', bordercolor: '#334155', borderwidth: 1, font: { size: 11, color: '#94a3b8' } },
  })

  return (
    <section className="w-full min-h-screen bg-gray-950 text-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-300 to-slate-500 bg-clip-text text-transparent">Transfer Function</h2>
        <p className="mt-2 text-sm text-gray-400">Y(s) = H(s)·X(s) — The system as a multiplier in transform space.</p>
        <p className="mt-1 text-sm text-gray-500 font-mono">H(s) = {alpha} / (s + {alpha})</p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-6 flex flex-col gap-6 h-fit">
          <select value={inputType} onChange={e => setInputType(e.target.value)} className="w-full rounded-lg bg-gray-800/80 border border-gray-700/60 text-sm text-gray-200 px-3 py-2 cursor-pointer appearance-none hover:border-gray-600">
            {['Step','Ramp','Sinusoid'].map(s => <option key={s}>{s}</option>)}
          </select>
          <div>
            <div className="flex justify-between mb-1"><label className="text-sm text-gray-300">α (pole)</label><span className="text-sm font-mono text-indigo-400">{alpha}</span></div>
            <input type="range" min={0.5} max={8} step={0.5} value={alpha} onChange={e => setAlpha(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-700/60 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500" />
          </div>
          <div className="text-xs text-gray-500 border-t border-gray-800 pt-4 space-y-2">
            <p><strong className="text-gray-400">Key idea:</strong> Convolution in time = multiplication in s-domain. H(s) encodes everything about the system.</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-3 sm:p-4 flex flex-col gap-4 overflow-hidden">
          <Plot data={[inputTrace, outputTrace]} layout={mkLayout('Input x(t) → Output y(t)', 't')} config={plotCfg} useResizeHandler style={{ width: '100%', height: '320px' }} />
          <Plot data={[tfTrace]} layout={mkLayout('|H(s)| along real axis', 'σ (real part of s)')} config={plotCfg} useResizeHandler style={{ width: '100%', height: '260px' }} />
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
            Y(s) = H(s) · X(s)
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The Laplace Transform <span className="font-mono text-gray-300">H(s)</span> of the impulse response <span className="font-mono text-gray-300">h(t)</span>. Convolution in the time domain becomes simple algebraic multiplication in the complex frequency domain.
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Applications & Usage
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Essential for building block diagrams in control engineering. If you connect two systems in series, their combined transfer function is simply <span className="font-mono text-gray-300">H_{total}(s) = H_1(s) \cdot H_2(s)</span>.
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            When to use it
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Best when you want to avoid performing complex time-domain convolutions. By factorizing the numerator and denominator into roots, you instantly find the system's zeros and poles.
          </p>
        </div>
      </div>
    </section>
  )
}
