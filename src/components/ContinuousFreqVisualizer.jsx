import { useState, useMemo } from 'react'
import PlotModule from 'react-plotly.js'
const Plot = PlotModule.default || PlotModule
import { linspace, generateRectPulse, generateGaussianPulse, generateExponentialDecay, computeCTFT } from '../utils/signalMath'

const darkAxis = {
  zeroline: true, zerolinecolor: '#475569', zerolinewidth: 1.5,
  gridcolor: '#1e293b', tickfont: { color: '#64748b', size: 11 }, color: '#64748b',
}
const plotCfg = { displayModeBar: false, responsive: true }

export default function ContinuousFreqVisualizer() {
  const [signal, setSignal] = useState('Rectangular Pulse')
  const [width, setWidth] = useState(2)
  const [sigma, setSigma] = useState(1)
  const [alpha, setAlpha] = useState(1)
  const [freq, setFreq] = useState(5)

  const { timeTrace, magTrace, phaseTrace } = useMemo(() => {
    let sig
    if (signal === 'Rectangular Pulse') sig = generateRectPulse(-10, 10, 800, width)
    else if (signal === 'Gaussian Pulse') sig = generateGaussianPulse(-10, 10, 800, sigma)
    else if (signal === 'Exponential Decay') sig = generateExponentialDecay(-10, 10, 800, 1, alpha)
    else {
      const x = linspace(-10, 10, 800)
      const y = x.map(t => Math.abs(t) <= width / 2 ? Math.sin(freq * t) : 0)
      sig = { x, y }
    }
    const ctft = computeCTFT(sig.x, sig.y, -20, 20, 400)
    return {
      timeTrace: { x: sig.x, y: sig.y, type: 'scatter', mode: 'lines', line: { color: '#22d3ee', width: 2.5 } },
      magTrace: { x: ctft.freqs, y: ctft.magnitudes, type: 'scatter', mode: 'lines', line: { color: '#06b6d4', width: 2.5 } },
      phaseTrace: { x: ctft.freqs, y: ctft.phases, type: 'scatter', mode: 'lines', line: { color: '#67e8f9', width: 2 } },
    }
  }, [signal, width, sigma, alpha, freq])

  const mkLayout = (title, xLbl, yLbl) => ({
    margin: { l: 50, r: 20, t: 28, b: 44 },
    title: { text: title, font: { size: 14, color: '#94a3b8' } },
    xaxis: { ...darkAxis, title: { text: xLbl, font: { size: 12, color: '#94a3b8' } } },
    yaxis: { ...darkAxis, title: { text: yLbl, font: { size: 12, color: '#94a3b8' } } },
    paper_bgcolor: '#0f172a', plot_bgcolor: '#0f172a', font: { color: '#cbd5e1' }, showlegend: false,
  })

  const Slider = ({ label, value, setValue, min, max, step }) => (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm font-mono font-semibold text-cyan-400 tabular-nums">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => setValue(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-700/60
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500
          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
    </div>
  )

  return (
    <section className="w-full min-h-screen bg-gray-950 text-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
          Continuous-Frequency Domain (jω)
        </h2>
        <p className="mt-2 text-sm text-gray-400 font-mono">X(jω) = ∫ x(t) e^(-jωt) dt — Fourier Transform pairs</p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-6 flex flex-col gap-6 h-fit">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Signal</h3>
          <select value={signal} onChange={e => setSignal(e.target.value)}
            className="w-full rounded-lg bg-gray-800/80 border border-gray-700/60 text-sm text-gray-200 px-3 py-2 cursor-pointer appearance-none hover:border-gray-600">
            {['Rectangular Pulse','Gaussian Pulse','Exponential Decay','Windowed Sinusoid'].map(s => <option key={s}>{s}</option>)}
          </select>
          {(signal.includes('Rect') || signal.includes('Windowed')) && <Slider label="Width" value={width} setValue={setWidth} min={0.5} max={8} step={0.5} />}
          {signal.includes('Gauss') && <Slider label="σ (Spread)" value={sigma} setValue={setSigma} min={0.2} max={4} step={0.2} />}
          {signal.includes('Expon') && <Slider label="α (Decay)" value={alpha} setValue={setAlpha} min={0.2} max={5} step={0.2} />}
          {signal.includes('Windowed') && <Slider label="Frequency" value={freq} setValue={setFreq} min={1} max={15} step={0.5} />}
          <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-800 pt-4">
            <p><strong className="text-gray-400">Uncertainty principle:</strong> Narrow in time → wide in frequency. Wide in time → narrow in frequency.</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-3 sm:p-4 flex flex-col gap-3 overflow-hidden">
          <Plot data={[timeTrace]} layout={mkLayout('Signal x(t)', 't', 'x(t)')} config={plotCfg} useResizeHandler style={{ width: '100%', height: '220px' }} />
          <Plot data={[magTrace]} layout={mkLayout('Magnitude |X(jω)|', 'ω (rad/s)', '|X(jω)|')} config={plotCfg} useResizeHandler style={{ width: '100%', height: '220px' }} />
          <Plot data={[phaseTrace]} layout={mkLayout('Phase ∠X(jω)', 'ω (rad/s)', 'rad')} config={plotCfg} useResizeHandler style={{ width: '100%', height: '200px' }} />
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
            X(jω) = ∫ x(t) e⁻ʲʷᵗ dt
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The Continuous-Time Fourier Transform (CTFT) breaks a time signal down into an infinite sum of complex sinusoids. It evaluates the Laplace transform purely on the imaginary axis.
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Applications & Usage
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Crucial in communications theory (AM/FM radio, WiFi, cellular). Used to determine the bandwidth of a signal, design analog filters, and modulate signals onto high-frequency carriers.
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            When to use it
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Best when analyzing the <strong className="text-gray-300">steady-state frequency spectrum</strong> of stable signals. It explicitly reveals which frequencies are present (Magnitude) and their timing relative to each other (Phase).
          </p>
        </div>
      </div>
    </section>
  )
}
