import { useState, useMemo } from 'react'
import PlotModule from 'react-plotly.js'
const Plot = PlotModule.default || PlotModule
import { linspace } from '../utils/signalMath'

const darkAxis = { zeroline: true, zerolinecolor: '#475569', zerolinewidth: 1.5, gridcolor: '#1e293b', tickfont: { color: '#64748b', size: 11 }, color: '#64748b' }
const plotCfg = { displayModeBar: false, responsive: true }

export default function FrequencyResponseVisualizer() {
  const [filterType, setFilterType] = useState('Low-Pass')
  const [fc, setFc] = useState(5)
  const [order, setOrder] = useState(1)

  const { magTrace, phaseTrace } = useMemo(() => {
    const w = linspace(0.1, 50, 500)
    const wc = 2 * Math.PI * fc
    let magDB, phase
    if (filterType === 'Low-Pass') {
      magDB = w.map(wi => -10 * order * Math.log10(1 + Math.pow(wi / wc, 2)))
      phase = w.map(wi => -order * Math.atan(wi / wc))
    } else if (filterType === 'High-Pass') {
      magDB = w.map(wi => -10 * order * Math.log10(1 + Math.pow(wc / wi, 2)))
      phase = w.map(wi => order * Math.atan(wc / wi))
    } else {
      const bw = wc * 0.3
      magDB = w.map(wi => { const x = (wi - wc) / bw; return -10 * Math.log10(1 + x * x) })
      phase = w.map(wi => { const x = (wi - wc) / (wc * 0.3); return -Math.atan(x) })
    }
    return {
      magTrace: { x: w, y: magDB, type: 'scatter', mode: 'lines', line: { color: '#818cf8', width: 3 } },
      phaseTrace: { x: w, y: phase.map(p => p * 180 / Math.PI), type: 'scatter', mode: 'lines', line: { color: '#67e8f9', width: 2.5 } },
    }
  }, [filterType, fc, order])

  const mkLayout = (title, yLbl) => ({
    margin: { l: 55, r: 20, t: 28, b: 44 },
    title: { text: title, font: { size: 14, color: '#94a3b8' } },
    xaxis: { ...darkAxis, title: { text: 'ω (rad/s)', font: { size: 12, color: '#94a3b8' } }, type: 'log' },
    yaxis: { ...darkAxis, title: { text: yLbl, font: { size: 12, color: '#94a3b8' } } },
    paper_bgcolor: '#0f172a', plot_bgcolor: '#0f172a', font: { color: '#cbd5e1' }, showlegend: false,
    shapes: [{ type: 'line', x0: 2 * Math.PI * fc, x1: 2 * Math.PI * fc, y0: 0, y1: 1, yref: 'paper', line: { color: '#f59e0b55', width: 2, dash: 'dot' } }],
  })

  return (
    <section className="w-full min-h-screen bg-gray-950 text-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-300 to-slate-500 bg-clip-text text-transparent">Frequency Response (Bode Plot)</h2>
        <p className="mt-2 text-sm text-gray-400">How a system amplifies or attenuates each frequency — the Bode plot view.</p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-6 flex flex-col gap-6 h-fit">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full rounded-lg bg-gray-800/80 border border-gray-700/60 text-sm text-gray-200 px-3 py-2 cursor-pointer appearance-none hover:border-gray-600">
            {['Low-Pass','High-Pass','Band-Pass'].map(s => <option key={s}>{s}</option>)}
          </select>
          <div>
            <div className="flex justify-between mb-1"><label className="text-sm text-gray-300">Cutoff (Hz)</label><span className="text-sm font-mono text-cyan-400">{fc}</span></div>
            <input type="range" min={1} max={20} step={0.5} value={fc} onChange={e => setFc(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-700/60 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500" />
          </div>
          {filterType !== 'Band-Pass' && <div>
            <div className="flex justify-between mb-1"><label className="text-sm text-gray-300">Order</label><span className="text-sm font-mono text-cyan-400">{order}</span></div>
            <input type="range" min={1} max={5} step={1} value={order} onChange={e => setOrder(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-700/60 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500" />
          </div>}
          <div className="text-xs text-gray-500 border-t border-gray-800 pt-4">
            <p><strong className="text-gray-400">Bode plot:</strong> Log-frequency scale reveals the -20n dB/decade rolloff of an nth-order filter. Dotted line = cutoff frequency.</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-3 sm:p-4 flex flex-col gap-4 overflow-hidden">
          <Plot data={[magTrace]} layout={mkLayout('Magnitude (Bode)', 'dB')} config={plotCfg} useResizeHandler style={{ width: '100%', height: '300px' }} />
          <Plot data={[phaseTrace]} layout={mkLayout('Phase', 'degrees')} config={plotCfg} useResizeHandler style={{ width: '100%', height: '280px' }} />
        </div>
      </div>

      {/* Educational Content */}
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            Core Formula
          </h3>
          <p className="text-sm text-gray-200 leading-relaxed font-mono bg-gray-950 p-3 rounded-lg border border-gray-800 mb-4 text-center shadow-inner">
            H(jω) = |H(jω)| ∠ H(jω)
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Evaluating the transfer function <span className="font-mono text-gray-300">H(s)</span> along the purely imaginary axis <span className="font-mono text-gray-300">s=j\omega</span>. The Magnitude plot shows attenuation (in dB), and the Phase plot shows delay.
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Applications & Usage
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Essential for filter design (e.g., crossovers in loudspeakers, noise-cancelling circuits). A Bode plot clearly shows the "Passband" and the "Stopband", with a defined Cutoff Frequency.
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            When to use it
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Best for determining a system's <strong className="text-gray-300">Steady-State response</strong> to sinusoidal inputs. Plotting Magnitude in decibels versus log frequency turns polynomial multiplication into straight-line additions.
          </p>
        </div>
      </div>
    </section>
  )
}
