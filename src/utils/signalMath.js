// ---------------------------------------------------------------------------
//  signalMath.js — Signal generation utilities & transformation equations
// ---------------------------------------------------------------------------

/**
 * Build a linearly-spaced array from `min` to `max` with `n` samples.
 */
export function linspace(min, max, n) {
  const step = (max - min) / (n - 1)
  return Array.from({ length: n }, (_, i) => min + i * step)
}

// ======================== Additional Generators ============================

/** Causal exponential decay: A·e^(-αt)·u(t) */
export function generateExponentialDecay(tMin, tMax, points, A = 1, alpha = 1) {
  const x = linspace(tMin, tMax, points)
  const y = x.map((t) => (t >= 0 ? A * Math.exp(-alpha * t) : 0))
  return { x, y }
}

/** Causal damped sinusoid: A·e^(-σt)·sin(ωt)·u(t) */
export function generateDampedSinusoid(tMin, tMax, points, A = 1, sigma = 1, omega = 5) {
  const x = linspace(tMin, tMax, points)
  const y = x.map((t) => (t >= 0 ? A * Math.exp(-sigma * t) * Math.sin(omega * t) : 0))
  return { x, y }
}

/** Rectangular pulse centred at 0 with given width */
export function generateRectPulse(tMin, tMax, points, width = 1) {
  const x = linspace(tMin, tMax, points)
  const y = x.map((t) => (Math.abs(t) <= width / 2 ? 1 : 0))
  return { x, y }
}

/** Gaussian pulse e^(-t²/2σ²) */
export function generateGaussianPulse(tMin, tMax, points, sigma = 1) {
  const x = linspace(tMin, tMax, points)
  const y = x.map((t) => Math.exp(-(t * t) / (2 * sigma * sigma)))
  return { x, y }
}

// ====================== Frequency-Domain Computation =======================

/**
 * Numerical approximation of the Continuous-Time Fourier Transform.
 * Returns { freqs, magnitudes, phases }.
 */
export function computeCTFT(t, xt, freqMin, freqMax, numFreqs) {
  const freqs = linspace(freqMin, freqMax, numFreqs)
  const dt = t.length > 1 ? t[1] - t[0] : 1
  const magnitudes = []
  const phases = []
  for (const omega of freqs) {
    let re = 0, im = 0
    for (let i = 0; i < t.length; i++) {
      const angle = -omega * t[i]
      re += xt[i] * Math.cos(angle) * dt
      im += xt[i] * Math.sin(angle) * dt
    }
    magnitudes.push(Math.sqrt(re * re + im * im))
    phases.push(Math.atan2(im, re))
  }
  return { freqs, magnitudes, phases }
}

/**
 * N-point DFT computed directly.
 * Returns { freqs (bin indices 0…N-1), magnitudes, phases }.
 */
export function computeDFT(xn) {
  const N = xn.length
  const magnitudes = []
  const phases = []
  const freqs = []
  for (let k = 0; k < N; k++) {
    let re = 0, im = 0
    for (let n = 0; n < N; n++) {
      const angle = (-2 * Math.PI * k * n) / N
      re += xn[n] * Math.cos(angle)
      im += xn[n] * Math.sin(angle)
    }
    magnitudes.push(Math.sqrt(re * re + im * im))
    phases.push(Math.atan2(im, re))
    freqs.push(k)
  }
  return { freqs, magnitudes, phases }
}

// ========================== Signal Generators ==============================
//
// Every generator follows the canonical transformation form:
//
//   y(t) = A · x(a·t + b)
//
// where τ = a·t + b is the inner (transformed) variable.
// Each returns { x: number[], y: number[] } ready for Plotly traces.
// --------------------------------------------------------------------------

/**
 * Unit step: x(τ) = 1 if τ ≥ 0, else 0
 *
 * @param {number} tMin   - start of time axis
 * @param {number} tMax   - end of time axis
 * @param {number} points - number of samples
 * @param {number} A      - amplitude scale
 * @param {number} a      - time scale (stretch / compress / reverse)
 * @param {number} b      - time shift
 * @returns {{ x: number[], y: number[] }}
 */
export function generateStep(tMin, tMax, points, A = 1, a = 1, b = 0) {
  const x = linspace(tMin, tMax, points)
  const y = x.map((t) => {
    const tau = a * t + b
    return tau >= 0 ? A : 0
  })
  return { x, y }
}

/**
 * Unit ramp: x(τ) = τ if τ ≥ 0, else 0
 */
export function generateRamp(tMin, tMax, points, A = 1, a = 1, b = 0) {
  const x = linspace(tMin, tMax, points)
  const y = x.map((t) => {
    const tau = a * t + b
    return tau >= 0 ? A * tau : 0
  })
  return { x, y }
}

/**
 * Discrete impulse approximation: y = A at the sample closest to τ = 0,
 * y = 0 everywhere else.
 */
export function generateImpulse(tMin, tMax, points, A = 1, a = 1, b = 0) {
  const x = linspace(tMin, tMax, points)
  const y = new Array(points).fill(0)

  // Find the index whose τ = a·t + b is nearest to zero
  let bestIdx = 0
  let bestDist = Infinity
  for (let i = 0; i < points; i++) {
    const dist = Math.abs(a * x[i] + b)
    if (dist < bestDist) {
      bestDist = dist
      bestIdx = i
    }
  }
  y[bestIdx] = A

  return { x, y }
}

/**
 * Sinusoid: x(τ) = sin(τ)
 */
export function generateSinusoid(tMin, tMax, points, A = 1, a = 1, b = 0) {
  const x = linspace(tMin, tMax, points)
  const y = x.map((t) => {
    const tau = a * t + b
    return A * Math.sin(tau)
  })
  return { x, y }
}

// ===================== Transformation Equations ============================
//
// LaTeX strings wrapped in $$ delimiters for display with MathJax / KaTeX.
// --------------------------------------------------------------------------

export const TRANSFORMATION_EQUATIONS = {
  laplace:
    '$$X(s) = \\int_{-\\infty}^{\\infty} x(t)\\, e^{-st}\\, dt$$',

  ctft:
    '$$X(j\\omega) = \\int_{-\\infty}^{\\infty} x(t)\\, e^{-j\\omega t}\\, dt$$',

  zTransform:
    '$$X(z) = \\sum_{n=-\\infty}^{\\infty} x[n]\\, z^{-n}$$',

  dtft:
    '$$X(e^{j\\Omega}) = \\sum_{n=-\\infty}^{\\infty} x[n]\\, e^{-j\\Omega n}$$',

  convolution:
    '$$y(t) = \\int_{-\\infty}^{\\infty} x(\\tau)\\, h(t - \\tau)\\, d\\tau$$',
}
