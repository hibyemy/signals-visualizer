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
    </section>
  )
}
