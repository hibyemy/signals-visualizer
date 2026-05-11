import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import DomainMap from './pages/DomainMap'
import TimeTransformVisualizer from './components/TimeTransformVisualizer'
import LaplaceVisualizer from './components/LaplaceVisualizer'
import ContinuousFreqVisualizer from './components/ContinuousFreqVisualizer'
import DiscreteTimeVisualizer from './components/DiscreteTimeVisualizer'
import ZDomainVisualizer from './components/ZDomainVisualizer'
import DiscreteFreqVisualizer from './components/DiscreteFreqVisualizer'
import ImpulseResponseVisualizer from './components/ImpulseResponseVisualizer'
import TransferFunctionVisualizer from './components/TransferFunctionVisualizer'
import FrequencyResponseVisualizer from './components/FrequencyResponseVisualizer'
import './App.css'

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-950">
        {/* Global Navigation Bar */}
        <nav className="h-16 shrink-0 border-b border-gray-800 bg-gray-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-inner shadow-white/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white/90">
              Signals & Systems <span className="font-light text-gray-400">Interactive Reference</span>
            </h1>
          </div>
          <Link
            to="/"
            className="text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700/60 hover:text-white px-4 py-2 rounded-md ring-1 ring-gray-700/50 transition-all duration-200"
          >
            Domain Map
          </Link>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 w-full relative">
          <Routes>
            <Route path="/" element={<DomainMap />} />
            {/* 6 Primary Domains */}
            <Route path="/learn/continuous-time" element={<TimeTransformVisualizer />} />
            <Route path="/learn/laplace" element={<LaplaceVisualizer />} />
            <Route path="/learn/continuous-frequency" element={<ContinuousFreqVisualizer />} />
            <Route path="/learn/discrete-time" element={<DiscreteTimeVisualizer />} />
            <Route path="/learn/z-domain" element={<ZDomainVisualizer />} />
            <Route path="/learn/discrete-frequency" element={<DiscreteFreqVisualizer />} />
            {/* 3 Bridge Concepts */}
            <Route path="/learn/impulse-response" element={<ImpulseResponseVisualizer />} />
            <Route path="/learn/transfer-function" element={<TransferFunctionVisualizer />} />
            <Route path="/learn/frequency-response" element={<FrequencyResponseVisualizer />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
