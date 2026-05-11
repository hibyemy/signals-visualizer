import { useState, useMemo } from 'react'
import PlotModule from 'react-plotly.js'
const Plot = PlotModule.default || PlotModule

const darkAxis = {
  zeroline: true, zerolinecolor: '#475569', zerolinewidth: 1.5,
  gridcolor: '#1e293b', tickfont: { color: '#64748b', size: 11 }, color: '#64748b',
}
const plotCfg = { displayModeBar: false, responsive: true }

function unitCircleTrace() {
  const theta = Array.from({ length: 201 }, (_, i) => (i / 200) * 2 * Math.PI)
  return { x: theta.map(Math.cos), y: theta.map(Math.sin), type: 'scatter', mode: 'lines', name: 'Unit Circle', line: { color: '#475569', width: 1.5, dash: 'dot' }, hoverinfo: 'skip' }
}

export default function ZDomainVisualizer() {
  const [system, setSystem] = useState('First-Order IIR')
  const [a1, setA1] = useState(0.8)
  const [a2, setA2] = useState(0.5)
  const [angle, setAngle] = useState(45)
  const [radius, setRadius] = useState(0.9)
  const [M, setM] = useState(4)

  const { poleTrace, zeroTrace, stemTrace, eqn, stableMsg } = useMemo(() => {
    let poles = [], zeros = [], hn = []
    let eqnStr = ''
    const N = 30

    if (system === 'First-Order IIR') {
      poles = [{ re: a1, im: 0 }]
      hn = Array.from({ length: N }, (_, n) => Math.pow(a1, n))
      eqnStr = `H(z) = 1 / (1 − ${a1}z⁻¹)   pole at z = ${a1}`
    } else if (system === 'Second-Order IIR') {
      const rad = (angle * Math.PI) / 180
      poles = [{ re: radius * Math.cos(rad), im: radius * Math.sin(rad) }, { re: radius * Math.cos(rad), im: -radius * Math.sin(rad) }]
      hn = Array.from({ length: N }, (_, n) => Math.pow(radius, n) * Math.sin((n + 1) * rad) / Math.sin(rad))
      eqnStr = `Complex poles at r=${radius}, θ=±${angle}°`
    } else {
      poles = []
      zeros = Array.from({ length: M }, (_, i) => {
        const th = (2 * Math.PI * i) / M
        return { re: Math.cos(th), im: Math.sin(th) }
      })
      hn = Array.from({ length: N }, (_, n) => n < M ? 1 / M : 0)
      eqnStr = `H(z) = (1/M) Σ z⁻ⁿ — ${M}-tap moving average`
    }

    const allStable = poles.every(p => Math.sqrt(p.re * p.re + p.im * p.im) < 1)

    return {
      poleTrace: { x: poles.map(p => p.re), y: poles.map(p => p.im), type: 'scatter', mode: 'markers', name: 'Poles', marker: { symbol: 'x', size: 14, color: '#ef4444', line: { width: 3, color: '#ef4444' } } },
      zeroTrace: { x: zeros.map(z => z.re), y: zeros.map(z => z.im), type: 'scatter', mode: 'markers', name: 'Zeros', marker: { symbol: 'circle-open', size: 14, color: '#22d3ee', line: { width: 3 } } },
      stemTrace: { x: Array.from({ length: N }, (_, i) => i), y: hn, type: 'bar', name: 'h[n]', marker: { color: '#f59e0b' }, width: 0.3 },
      eqn: eqnStr,
      stableMsg: allStable ? '✓ Stable — all poles inside unit circle' : '⚠ Unstable — poles outside unit circle!',
    }
  }, [system, a1, a2, angle, radius, M])

  const zLayout = {
    margin: { l: 50, r: 20, t: 28, b: 44 },
    title: { text: 'z-Plane', font: { size: 14, color: '#94a3b8' } },
    xaxis: { ...darkAxis, title: { text: 'Real', font: { size: 12, color: '#94a3b8' } }, range: [-1.8, 1.8], scaleanchor: 'y' },
    yaxis: { ...darkAxis, title: { text: 'Imag', font: { size: 12, color: '#94a3b8' } }, range: [-1.8, 1.8] },
    paper_bgcolor: '#0f172a', plot_bgcolor: '#0f172a', font: { color: '#cbd5e1' },
    showlegend: true, legend: { x: 0.01, y: 0.99, bgcolor: 'rgba(15,23,42,0.75)', bordercolor: '#334155', borderwidth: 1, font: { size: 11, color: '#94a3b8' } },
  }
  const hLayout = {
    margin: { l: 50, r: 20, t: 28, b: 44 },
    title: { text: 'Impulse Response h[n]', font: { size: 14, color: '#94a3b8' } },
    xaxis: { ...darkAxis, title: { text: 'n', font: { size: 12, color: '#94a3b8' } } },
    yaxis: { ...darkAxis },
    paper_bgcolor: '#0f172a', plot_bgcolor: '#0f172a', font: { color: '#cbd5e1' }, showlegend: false, bargap: 0.6,
  }

  const Slider = ({ label, value, setValue, min, max, step }) => (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm font-mono font-semibold text-amber-400 tabular-nums">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => setValue(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-700/60
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500
          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
    </div>
  )

  return (
    <section className="w-full min-h-screen bg-gray-950 text-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
          Z-Domain (z-Plane)
        </h2>
        <p className="mt-2 text-sm text-gray-400 font-mono">{eqn}</p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-6 flex flex-col gap-6 h-fit">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Digital System</h3>
          <select value={system} onChange={e => setSystem(e.target.value)}
            className="w-full rounded-lg bg-gray-800/80 border border-gray-700/60 text-sm text-gray-200 px-3 py-2 cursor-pointer appearance-none hover:border-gray-600">
            {['First-Order IIR','Second-Order IIR','FIR Moving Average'].map(s => <option key={s}>{s}</option>)}
          </select>
          {system === 'First-Order IIR' && <Slider label="Pole (a₁)" value={a1} setValue={setA1} min={-0.99} max={0.99} step={0.05} />}
          {system === 'Second-Order IIR' && <>
            <Slider label="Radius (r)" value={radius} setValue={setRadius} min={0.1} max={1.2} step={0.05} />
            <Slider label="Angle (θ°)" value={angle} setValue={setAngle} min={10} max={170} step={5} />
          </>}
          {system === 'FIR Moving Average' && <Slider label="Taps (M)" value={M} setValue={setM} min={2} max={16} step={1} />}
          <div className={`text-xs font-semibold border-t border-gray-800 pt-4 ${stableMsg.includes('✓') ? 'text-emerald-400' : 'text-amber-400'}`}>{stableMsg}</div>
        </div>
        <div className="rounded-2xl bg-gray-900/70 ring-1 ring-gray-800/80 backdrop-blur-md p-3 sm:p-4 flex flex-col gap-4 overflow-hidden">
          <Plot data={[unitCircleTrace(), poleTrace, zeroTrace]} layout={zLayout} config={plotCfg} useResizeHandler style={{ width: '100%', height: '340px' }} />
          <Plot data={[stemTrace]} layout={hLayout} config={plotCfg} useResizeHandler style={{ width: '100%', height: '280px' }} />
        </div>
      </div>

      {/* Educational Content */}
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            Core Formula
          </h3>
          <p className="text-sm text-gray-200 leading-relaxed font-mono bg-gray-950 p-3 rounded-lg border border-gray-800 mb-4 text-center shadow-inner">
            X(z) = Σ x[n] z⁻ⁿ
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The Z-Transform maps a discrete sequence <span className="font-mono text-gray-300">x[n]</span> into a complex plane. The variable <span className="font-mono text-gray-300">z^{-1}</span> mathematically represents a single unit delay in digital logic.
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Applications & Usage
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Used to design and analyze digital filters (IIR and FIR). Instead of solving recursive difference equations, you map the coefficients directly into poles and zeros on the Z-plane.
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            When to use it
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            The discrete equivalent of Laplace. Best for checking digital system <strong className="text-gray-300">stability</strong>: a digital filter is strictly stable if and only if all of its poles lie strictly <strong className="text-gray-300">inside the unit circle</strong> (<span className="font-mono text-gray-300">|z| &lt; 1</span>).
          </p>
        </div>
      </div>
    </section>
  )
}
