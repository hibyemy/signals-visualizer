import { useState, useMemo } from 'react'
import PlotModule from 'react-plotly.js'
const Plot = PlotModule.default || PlotModule
import { computeDFT } from '../utils/signalMath'

const darkAxis = {
  zeroline: true, zerolinecolor: '#475569', zerolinewidth: 1.5,
  gridcolor: '#1e293b', tickfont: { color: '#64748b', size: 11 }, color: '#64748b',
}
const plotCfg = { displayModeBar: false, responsive: true }

export default function DiscreteFreqVisualizer() {
  const [signal, setSignal] = useState('Cosine')
  const [N, setN] = useState(32)
  const [freq, setFreq] = useState(4)
  const [decay, setDecay] = useState(0.85)

  const { sigTrace, magTrace, phaseTrace } = useMemo(() => {
    let xn
    if (signal === 'Cosine') xn = Array.from({ length: N }, (_, n) => Math.cos((2 * Math.PI * freq * n) / N))
    else if (signal === 'Exponential') xn = Array.from({ length: N }, (_, n) => Math.pow(decay, n))
    else if (signal === 'Impulse') xn = Array.from({ length: N }, (_, n) => n === 0 ? 1 : 0)
    else xn = Array.from({ length: N }, (_, n) => n < N / 2 ? 1 : 0)

    const dft = computeDFT(xn)
    const ns = Array.from({ length: N }, (_, i) => i)
    const normFreqs = dft.freqs.map(k => (k / N).toFixed(3))

    return {
      sigTrace: { x: ns, y: xn, type: 'bar', name: 'x[n]', marker: { color: '#f472b6' }, width: 0.4 },
      magTrace: { x: normFreqs, y: dft.magnitudes, type: 'bar', name: '|X[k]|', marker: { color: '#e11d48' }, width: 0.6 / N },
      phaseTrace: { x: normFreqs, y: dft.phases, type: 'bar', name: '∠X[k]', marker: { color: '#fb7185' }, width: 0.6 / N },
    }
  }, [signal, N, freq, decay])

  const mkLayout = (title, xLbl, yLbl) => ({
    margin: { l: 50, r: 20, t: 28, b: 44 },
    title: { text: title, font: { size: 14, color: '#94a3b8' } },
    xaxis: { ...darkAxis, title: { text: xLbl, font: { size: 12, color: '#94a3b8' } } },
    yaxis: { ...darkAxis, title: { text: yLbl, font: { size: 12, color: '#94a3b8' } } },
    paper_bgcolor: '#0f172a', plot_bgcolor: '#0f172a', font: { color: '#cbd5e1' }, showlegend: false, bargap: 0.3,
  })

  const Slider = ({ label, value, setValue, min, max, step }) => (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm font-mono font-semibold text-rose-400 tabular-nums">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => setValue(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-700/60
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500
          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(225,29,72,0.5)]" />
    </div>
  )

  return (
    <section className="w-full min-h-screen bg-gray-950 text-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
          Discrete-Frequency Domain (DFT)
        </h2>
        <p className="mt-2 text-sm text-gray-400 font-mono">X[k] = Σ x[n] e^(-j2πkn/N) — {N}-point DFT</p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-6 flex flex-col gap-6 h-fit">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Parameters</h3>
          <select value={signal} onChange={e => setSignal(e.target.value)}
            className="w-full rounded-lg bg-gray-800/80 border border-gray-700/60 text-sm text-gray-200 px-3 py-2 cursor-pointer appearance-none hover:border-gray-600">
            {['Cosine','Exponential','Impulse','Rectangular'].map(s => <option key={s}>{s}</option>)}
          </select>
          <Slider label="N (DFT length)" value={N} setValue={v => setN(Math.round(v))} min={8} max={128} step={8} />
          {signal === 'Cosine' && <Slider label="Frequency (cycles)" value={freq} setValue={v => setFreq(Math.round(v))} min={1} max={Math.floor(N/2)} step={1} />}
          {signal === 'Exponential' && <Slider label="Decay (a)" value={decay} setValue={setDecay} min={0.5} max={0.99} step={0.01} />}
          <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-800 pt-4">
            <p><strong className="text-gray-400">DFT resolution:</strong> Δf = 1/N = {(1/N).toFixed(4)} cycles/sample</p>
            <p className="mt-1"><strong className="text-gray-400">Try:</strong> Set cosine freq to a non-integer to see spectral leakage.</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-3 sm:p-4 flex flex-col gap-3 overflow-hidden">
          <Plot data={[sigTrace]} layout={mkLayout('Signal x[n]', 'n', 'x[n]')} config={plotCfg} useResizeHandler style={{ width: '100%', height: '220px' }} />
          <Plot data={[magTrace]} layout={mkLayout('DFT Magnitude |X[k]|', 'k/N (normalized freq)', '|X[k]|')} config={plotCfg} useResizeHandler style={{ width: '100%', height: '220px' }} />
          <Plot data={[phaseTrace]} layout={mkLayout('DFT Phase ∠X[k]', 'k/N', 'rad')} config={plotCfg} useResizeHandler style={{ width: '100%', height: '200px' }} />
        </div>
      </div>
    </section>
  )
}
