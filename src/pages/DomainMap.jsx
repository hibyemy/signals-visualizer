import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'

/* ------------------------------------------------------------------ */
/*  Custom Nodes                                                      */
/* ------------------------------------------------------------------ */

const DOMAIN_COLORS = {
  'continuous-time':       { bg: 'from-blue-600/90  to-blue-800/90',  ring: 'ring-blue-400/50',  glow: 'shadow-blue-500/25'  },
  'laplace':               { bg: 'from-violet-600/90 to-violet-800/90', ring: 'ring-violet-400/50', glow: 'shadow-violet-500/25' },
  'continuous-frequency':  { bg: 'from-cyan-600/90   to-cyan-800/90',  ring: 'ring-cyan-400/50',  glow: 'shadow-cyan-500/25'  },
  'discrete-time':         { bg: 'from-emerald-600/90 to-emerald-800/90', ring: 'ring-emerald-400/50', glow: 'shadow-emerald-500/25' },
  'z-domain':              { bg: 'from-amber-600/90  to-amber-800/90', ring: 'ring-amber-400/50', glow: 'shadow-amber-500/25' },
  'discrete-frequency':    { bg: 'from-rose-600/90   to-rose-800/90',  ring: 'ring-rose-400/50',  glow: 'shadow-rose-500/25'  },
}

const handleStyle = { background: 'transparent', border: 'none', width: 8, height: 8 }

/** Primary domain card — large, coloured gradient */
function DomainNode({ data, id }) {
  const c = DOMAIN_COLORS[id] ?? { bg: 'from-gray-600 to-gray-800', ring: 'ring-gray-400/50', glow: 'shadow-gray-500/25' }

  return (
    <div
      className={`
        group relative w-[260px] rounded-2xl p-[1px]
        bg-gradient-to-br ${c.bg}
        ring-1 ${c.ring}
        shadow-lg ${c.glow} shadow-xl
        transition-all duration-300
        hover:scale-[1.04] hover:shadow-2xl hover:ring-2
        cursor-pointer select-none
      `}
    >
      <Handle type="target" position={Position.Top}    style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <Handle type="target" position={Position.Left}   id="left"  style={handleStyle} />
      <Handle type="source" position={Position.Right}  id="right" style={handleStyle} />

      <div className="rounded-2xl bg-gray-950/60 backdrop-blur-md px-5 py-4">
        <h3 className="text-[15px] font-semibold text-white tracking-tight leading-snug">
          {data.label}
        </h3>
        <p className="mt-1 text-[12px] text-gray-300/80 leading-relaxed">
          {data.subtitle}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-white/0 via-white/5 to-white/0" />
    </div>
  )
}

/** Bridge concept card — smaller, neutral slate tone */
function ConceptNode({ data }) {
  return (
    <div
      className="
        group relative w-[220px] rounded-xl p-[1px]
        bg-gradient-to-br from-slate-500/70 to-slate-700/70
        ring-1 ring-slate-400/30
        shadow-md shadow-slate-500/15
        transition-all duration-300
        hover:scale-[1.04] hover:shadow-lg hover:ring-2
        cursor-pointer select-none
      "
    >
      <Handle type="target" position={Position.Top}    style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <Handle type="target" position={Position.Left}   id="left"  style={handleStyle} />
      <Handle type="source" position={Position.Right}  id="right" style={handleStyle} />

      <div className="rounded-xl bg-gray-950/70 backdrop-blur-md px-4 py-3">
        <h3 className="text-[13px] font-semibold text-white/90 tracking-tight leading-snug">
          {data.label}
        </h3>
        <p className="mt-0.5 text-[11px] text-gray-400/80 leading-relaxed">
          {data.subtitle}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-white/0 via-white/5 to-white/0" />
    </div>
  )
}

const nodeTypes = { domainCard: DomainNode, conceptCard: ConceptNode }

/* ------------------------------------------------------------------ */
/*  Nodes                                                             */
/* ------------------------------------------------------------------ */

const initialNodes = [
  // ── Row 1: Analog / Continuous domains ────────────────────────────
  {
    id: 'continuous-time',
    type: 'domainCard',
    position: { x: 100, y: 50 },
    data: { label: 'Continuous-Time (t)', subtitle: 'Physical analog signals.' },
  },
  {
    id: 'laplace',
    type: 'domainCard',
    position: { x: 500, y: 50 },
    data: { label: 'Laplace (s-domain)', subtitle: 'Complex frequency & stability.' },
  },
  {
    id: 'continuous-frequency',
    type: 'domainCard',
    position: { x: 900, y: 50 },
    data: { label: 'Continuous-Frequency (jω)', subtitle: 'Analog frequency spectrum.' },
  },

  // ── Row 2: Bridge concepts ────────────────────────────────────────
  {
    id: 'impulse-response',
    type: 'conceptCard',
    position: { x: 120, y: 260 },
    data: { label: 'Impulse Response', subtitle: 'System characterization in time.' },
  },
  {
    id: 'transfer-function',
    type: 'conceptCard',
    position: { x: 520, y: 260 },
    data: { label: 'Transfer Function', subtitle: 'System model in transform space.' },
  },
  {
    id: 'frequency-response',
    type: 'conceptCard',
    position: { x: 920, y: 260 },
    data: { label: 'Frequency Response', subtitle: 'Gain & phase vs. frequency.' },
  },

  // ── Row 3: Digital / Discrete domains ─────────────────────────────
  {
    id: 'discrete-time',
    type: 'domainCard',
    position: { x: 100, y: 470 },
    data: { label: 'Discrete-Time (n)', subtitle: 'Sampled digital arrays.' },
  },
  {
    id: 'z-domain',
    type: 'domainCard',
    position: { x: 500, y: 470 },
    data: { label: 'Z-Domain (z)', subtitle: 'Digital stability & difference equations.' },
  },
  {
    id: 'discrete-frequency',
    type: 'domainCard',
    position: { x: 900, y: 470 },
    data: { label: 'Discrete-Frequency (e^jΩ)', subtitle: 'Digital frequency spectrum.' },
  },
]

/* ------------------------------------------------------------------ */
/*  Edges                                                             */
/* ------------------------------------------------------------------ */

const edgeLabelStyle = {
  fontSize: 11,
  fontWeight: 600,
  fill: '#d1d5db',
  letterSpacing: '0.01em',
}

const edgeBase = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: '#6b7280', strokeWidth: 2 },
  labelStyle: edgeLabelStyle,
  labelBgPadding: [8, 4],
  labelBgBorderRadius: 6,
  labelBgStyle: { fill: '#111827', fillOpacity: 0.85, stroke: '#374151', strokeWidth: 1 },
}

const dashedEdge = {
  ...edgeBase,
  style: { ...edgeBase.style, strokeDasharray: '8 4', stroke: '#f59e0b' },
  labelBgStyle: { ...edgeBase.labelBgStyle, stroke: '#f59e0b44' },
}

const conceptEdge = {
  ...edgeBase,
  style: { ...edgeBase.style, stroke: '#475569', strokeWidth: 1.5 },
  animated: false,
  labelStyle: { ...edgeLabelStyle, fontSize: 10, fill: '#94a3b8' },
  labelBgStyle: { ...edgeBase.labelBgStyle, stroke: '#334155', fillOpacity: 0.75 },
}

const initialEdges = [
  // ── Row 1 horizontal: right → left ────────────────────────────────
  { id: 'e-ct-lap',  source: 'continuous-time',      target: 'laplace',              sourceHandle: 'right', targetHandle: 'left',  label: 'Laplace Transform',        ...edgeBase },
  { id: 'e-ct-cf',   source: 'continuous-time',      target: 'continuous-frequency', sourceHandle: 'right', targetHandle: 'left',  label: 'Fourier Transform (CTFT)', ...edgeBase },
  { id: 'e-lap-cf',  source: 'laplace',              target: 'continuous-frequency', sourceHandle: 'right', targetHandle: 'left',  label: 'Evaluate at s = jω',       ...edgeBase },

  // ── Row 3 horizontal: right → left ────────────────────────────────
  { id: 'e-dt-z',    source: 'discrete-time',        target: 'z-domain',            sourceHandle: 'right', targetHandle: 'left',  label: 'Z-Transform',              ...edgeBase },
  { id: 'e-dt-df',   source: 'discrete-time',        target: 'discrete-frequency',  sourceHandle: 'right', targetHandle: 'left',  label: 'DTFT',                     ...edgeBase },
  { id: 'e-z-df',    source: 'z-domain',             target: 'discrete-frequency',  sourceHandle: 'right', targetHandle: 'left',  label: 'Evaluate at z = e^jΩ',     ...edgeBase },

  // ── Row 2 horizontal: concept bridges ─────────────────────────────
  { id: 'e-ir-tf',   source: 'impulse-response',     target: 'transfer-function',   sourceHandle: 'right', targetHandle: 'left',  label: 'Transform of h(t)',        ...conceptEdge },
  { id: 'e-tf-fr',   source: 'transfer-function',    target: 'frequency-response',  sourceHandle: 'right', targetHandle: 'left',  label: 'Evaluate on jω axis',      ...conceptEdge },

  // ── Vertical: analog ↔ digital (dashed = discretization) ─────────
  { id: 'e-ct-dt',   source: 'continuous-time',      target: 'discrete-time',                                                     label: 'Sampling (Ts) / Nyquist',  ...dashedEdge },
  { id: 'e-lap-z',   source: 'laplace',              target: 'z-domain',                                                          label: 'Bilinear Transform',       ...dashedEdge },
  { id: 'e-cf-df',   source: 'continuous-frequency', target: 'discrete-frequency',                                                label: 'Spectral Replication',     ...edgeBase },

  // ── Vertical: domains → concept row (downward) ────────────────────
  { id: 'e-ct-ir',   source: 'continuous-time',      target: 'impulse-response',                                                  label: 'Apply δ(t)',               ...conceptEdge },
  { id: 'e-lap-tf',  source: 'laplace',              target: 'transfer-function',                                                 label: 'H(s) = Y(s)/X(s)',         ...conceptEdge },
  { id: 'e-cf-fr',   source: 'continuous-frequency', target: 'frequency-response',                                                label: 'H(jω) magnitude & phase',  ...conceptEdge },

  // ── Vertical: concept row → digital domains (downward) ────────────
  { id: 'e-ir-dt',   source: 'impulse-response',     target: 'discrete-time',                                                     label: 'Sample h[n]',              ...conceptEdge },
  { id: 'e-tf-z',    source: 'transfer-function',    target: 'z-domain',                                                          label: 'H(z) = Y(z)/X(z)',         ...conceptEdge },
  { id: 'e-fr-df',   source: 'frequency-response',   target: 'discrete-frequency',                                                label: 'H(e^jΩ) digital response', ...conceptEdge },
]

/* ------------------------------------------------------------------ */
/*  Page Component                                                    */
/* ------------------------------------------------------------------ */

export default function DomainMap() {
  const navigate = useNavigate()
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const onNodeClick = useCallback(
    (_event, node) => navigate(`/learn/${node.id}`),
    [navigate],
  )

  return (
    <div className="relative w-full h-screen bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-10 pointer-events-none">
        <div className="max-w-5xl mx-auto px-6 pt-6 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Signals &amp; Systems: The Domain Map
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Click any domain to explore its transformations.
          </p>
        </div>
      </header>

      {/* React Flow canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.4}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        className="!bg-transparent"
      >
        <Background variant="dots" gap={20} size={1} color="#ffffff0a" />
        <Controls
          showInteractive={false}
          className="!bg-gray-900/80 !border-gray-700/60 !rounded-xl !shadow-lg [&>button]:!bg-gray-800/80 [&>button]:!border-gray-700/50 [&>button]:!text-gray-300 [&>button:hover]:!bg-gray-700"
        />
      </ReactFlow>
    </div>
  )
}
