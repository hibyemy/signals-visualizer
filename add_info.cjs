const fs = require('fs');
const path = require('path');

const files = [
  { name: 'TimeTransformVisualizer.jsx', color: 'blue', formula: 'y(t) = A · x(at + b)', concept1: 'Signals are represented as continuous functions of time, $x(t)$. Transformations modify the amplitude $A$, time-scale $a$ (compression/expansion), and time-shift $b$ (delay/advance).', concept2: 'Used to analyze physical phenomena exactly as they occur in nature (e.g., audio waveforms, voltage across a resistor). Time shifting models delays, while time scaling models playback speed or Doppler effects.', concept3: 'Best for calculating specific time-domain metrics like **rise time**, **peak overshoot**, and **settling time**. It is the fundamental domain from which all other transforms are derived.' },
  
  { name: 'LaplaceVisualizer.jsx', color: 'violet', formula: 'X(s) = ∫ x(t) e⁻ˢᵗ dt', concept1: 'Transforms time $t$ into complex frequency $s = \\sigma + j\\omega$. The real part $\\sigma$ models exponential decay/growth, and the imaginary part $j\\omega$ models oscillation.', concept2: 'Heavily used in control systems engineering (e.g., PID controllers, cruise control). By plotting poles (x) and zeros (o) on the s-plane, you can instantly determine if a system is stable.', concept3: 'Best for solving linear differential equations involving initial conditions and analyzing **transient behavior**. Laplace handles unstable systems and signals that grow to infinity, unlike Fourier.' },
  
  { name: 'ContinuousFreqVisualizer.jsx', color: 'cyan', formula: 'X(jω) = ∫ x(t) e⁻ʲʷᵗ dt', concept1: 'The Continuous-Time Fourier Transform (CTFT) breaks a time signal down into an infinite sum of complex sinusoids. It evaluates the Laplace transform purely on the imaginary axis.', concept2: 'Crucial in communications theory (AM/FM radio, WiFi, cellular). Used to determine the bandwidth of a signal, design analog filters, and modulate signals onto high-frequency carriers.', concept3: 'Best when analyzing the **steady-state frequency spectrum** of stable signals. It explicitly reveals which frequencies are present (Magnitude) and their timing relative to each other (Phase).' },
  
  { name: 'DiscreteTimeVisualizer.jsx', color: 'emerald', formula: 'x[n] = x(n · Tₛ)', concept1: 'A continuous signal $x(t)$ is evaluated at discrete, evenly spaced intervals $T_s$. The resulting sequence $x[n]$ is an array of numbers representing the signal at sample index $n$.', concept2: 'Essential for bridging the physical analog world with digital computers. ADCs (Analog-to-Digital Converters) produce discrete-time signals so that DSP chips can analyze or compress the data.', concept3: 'Best when implementing algorithms in software. The critical constraint here is the **Nyquist Rate**: you must sample at least twice as fast as the highest frequency to avoid **aliasing**.' },
  
  { name: 'ZDomainVisualizer.jsx', color: 'amber', formula: 'X(z) = Σ x[n] z⁻ⁿ', concept1: 'The Z-Transform maps a discrete sequence $x[n]$ into a complex plane. The variable $z^{-1}$ mathematically represents a single unit delay in digital logic.', concept2: 'Used to design and analyze digital filters (IIR and FIR). Instead of solving recursive difference equations, you map the coefficients directly into poles and zeros on the Z-plane.', concept3: 'The discrete equivalent of Laplace. Best for checking digital system **stability**: a digital filter is strictly stable if and only if all of its poles lie strictly **inside the unit circle** ($|z| < 1$).' },
  
  { name: 'DiscreteFreqVisualizer.jsx', color: 'rose', formula: 'X[k] = Σ x[n] e⁻ʲ²ᵖⁱᵏⁿ/ᴺ', concept1: 'The Discrete Fourier Transform (DFT) converts a finite sequence of $N$ time samples into $N$ frequency bins. It calculates the Z-Transform purely on the unit circle.', concept2: 'The workhorse of modern DSP. Used for spectral analysis, MP3/JPEG compression, radar processing, and fast convolutions. Usually computed using the **Fast Fourier Transform (FFT)**.', concept3: 'Best when you have a block of digital data in a computer and need its frequency content. A common pitfall is **spectral leakage**, requiring windowing functions to fix.' },
  
  { name: 'ImpulseResponseVisualizer.jsx', color: 'indigo', formula: 'y(t) = x(t) * h(t)', concept1: 'An impulse $\\delta(t)$ is a theoretical infinitely sharp pulse containing all frequencies. The system\'s output to this pulse is $h(t)$. Via **convolution (*)**, any input can be processed.', concept2: 'Used heavily in acoustics and audio engineering. You can record the echo in a cathedral (the impulse response), and convolve that recording with dry vocals to make them sound like they were sung there.', concept3: 'Best for defining exactly how a Linear Time-Invariant (LTI) system behaves purely in the time domain. It contains the entire "DNA" of the system in a single transient waveform.' },
  
  { name: 'TransferFunctionVisualizer.jsx', color: 'indigo', formula: 'Y(s) = H(s) · X(s)', concept1: 'The Laplace Transform $H(s)$ of the impulse response $h(t)$. Convolution in the time domain becomes simple algebraic multiplication in the complex frequency domain.', concept2: 'Essential for building block diagrams in control engineering. If you connect two systems in series, their combined transfer function is simply $H_{total}(s) = H_1(s) \\cdot H_2(s)$.', concept3: 'Best when you want to avoid performing complex time-domain convolutions. By factorizing the numerator and denominator into roots, you instantly find the system\'s zeros and poles.' },
  
  { name: 'FrequencyResponseVisualizer.jsx', color: 'cyan', formula: 'H(jω) = |H(jω)| ∠ H(jω)', concept1: 'Evaluating the transfer function $H(s)$ along the purely imaginary axis $s=j\\omega$. The Magnitude plot shows attenuation (in dB), and the Phase plot shows delay.', concept2: 'Essential for filter design (e.g., crossovers in loudspeakers, noise-cancelling circuits). A Bode plot clearly shows the "Passband" and the "Stopband", with a defined Cutoff Frequency.', concept3: 'Best for determining a system\'s **Steady-State response** to sinusoidal inputs. Plotting Magnitude in decibels versus log frequency turns polynomial multiplication into straight-line additions.' }
];

const svg1 = `<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
const svg2 = `<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>`;
const svg3 = `<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>`;

files.forEach(file => {
  const filePath = path.join(__dirname, 'src', 'components', file.name);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if we already appended it
    if (content.includes('Educational Content')) return;

    const appendHTML = `
      {/* Educational Content */}
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-${file.color}-400 font-semibold mb-3 flex items-center gap-2">
            ${svg1}
            Core Formula
          </h3>
          <p className="text-sm text-gray-200 leading-relaxed font-mono bg-gray-950 p-3 rounded-lg border border-gray-800 mb-4 text-center shadow-inner">
            ${file.formula}
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            ${file.concept1.replace(/\$(\S.*?\$?)\$/g, '<span className="font-mono text-gray-300">$1</span>').replace(/\*\*(.*?)\*\*/g, '<strong className="text-gray-300">$1</strong>')}
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-${file.color}-400 font-semibold mb-3 flex items-center gap-2">
            ${svg2}
            Applications & Usage
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            ${file.concept2.replace(/\$(\S.*?\$?)\$/g, '<span className="font-mono text-gray-300">$1</span>').replace(/\*\*(.*?)\*\*/g, '<strong className="text-gray-300">$1</strong>')}
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-${file.color}-400 font-semibold mb-3 flex items-center gap-2">
            ${svg3}
            When to use it
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            ${file.concept3.replace(/\$(\S.*?\$?)\$/g, '<span className="font-mono text-gray-300">$1</span>').replace(/\*\*(.*?)\*\*/g, '<strong className="text-gray-300">$1</strong>')}
          </p>
        </div>
      </div>
    </section>`;

    content = content.replace('    </section>', appendHTML);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', file.name);
  } else {
    console.log('Not found', file.name);
  }
});
