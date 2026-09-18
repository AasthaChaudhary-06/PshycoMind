import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import graphAPI from '@/services/graphAPI';
import documentAPI from '@/services/documentAPI';
import { FullPageLoader } from '@/components/Loader';
import { showNotification } from '@/features/notification/notificationSlice';
import { useDispatch } from 'react-redux';
import { getErrorMessage } from '@/utils/error';

const SVG_W = 900;
const SVG_H = 560;

export default function KnowledgeGraph() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { documentId } = useParams();
  const [selected, setSelected] = useState(null);

  const { data: document } = useQuery({
    queryKey: ['documents', documentId],
    queryFn: () => documentAPI.get(documentId).then((r) => r.data.data),
    enabled: Boolean(documentId),
  });

  const { data: graph, isPending, isError } = useQuery({
    queryKey: ['graph', documentId],
    queryFn: () => graphAPI.get(documentId).then((r) => r.data.data),
    enabled: Boolean(documentId),
  });

  const generateMutation = useMutation({
    mutationFn: () => graphAPI.generate(documentId).then((r) => r.data.data),
    onSuccess: (data) => {
      dispatch(
        showNotification({
          type: 'success',
          title: 'Knowledge graph ready',
          message: `Mapped ${data.nodes.length} concepts from your document.`,
        }),
      );
      queryClient.invalidateQueries({ queryKey: ['graph', documentId] });
    },
    onError: (err) => {
      dispatch(showNotification({ type: 'error', title: 'Generation failed', message: getErrorMessage(err) }));
    },
  });

  if (isPending) return <FullPageLoader label="Building graph…" />;

  const ready = graph?.status === 'ready' && graph.nodes?.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Knowledge Graph</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {document?.title || 'Visualize the key concepts and their relationships.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/documents/${documentId}`} className="btn-secondary">
            Back to document
          </Link>
          <button
            type="button"
            className="btn-primary"
            disabled={generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
          >
            {generateMutation.isPending ? 'Generating…' : ready ? 'Regenerate' : 'Generate graph'}
          </button>
        </div>
      </div>

      {isError && !ready && (
        <div className="card p-8 text-center">
          <p className="mb-4 text-sm text-slate-500">
            No knowledge graph yet for this document.
          </p>
          <button type="button" className="btn-primary" onClick={() => generateMutation.mutate()}>
            Generate knowledge graph
          </button>
        </div>
      )}

      {ready && <GraphView graph={graph} selected={selected} onSelect={setSelected} />}
    </div>
  );
}

function GraphView({ graph, selected, onSelect }) {
  const nodes = graph.nodes || [];
  const edges = graph.edges || [];
  const positions = layout(nodes.length);

  const byId = {};
  nodes.forEach((n, i) => {
    byId[n.id] = { ...n, index: i, ...positions[i] };
  });

  const center = { x: SVG_W / 2, y: SVG_H / 2 };
  const selectedNode = selected ? byId[selected] : null;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-800">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {graph.title || 'Concept Map'}
        </h2>
        <span className="text-xs text-slate-400">
          {nodes.length} concepts · {edges.length} relationships
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="relative">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="h-auto w-full">
            {edges.map((edge, i) => {
              const s = byId[edge.source];
              const t = byId[edge.target];
              if (!s || !t) return null;
              const mid = {
                x: (s.x + t.x) / 2,
                y: (s.y + t.y) / 2,
              };
              return (
                <g key={`${edge.source}-${edge.target}-${i}`}>
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={selectedNode && (s.id === selectedNode.id || t.id === selectedNode.id) ? '#2563eb' : '#cbd5e1'}
                    strokeWidth={selectedNode && (s.id === selectedNode.id || t.id === selectedNode.id) ? 2 : 1}
                  />
                  {edge.relation && (
                    <text
                      x={mid.x}
                      y={mid.y - 6}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#94a3b8"
                    >
                      {edge.relation}
                    </text>
                  )}
                </g>
              );
            })}
            {nodes.map((n) => {
              const pos = byId[n.id];
              const r = 18 + (n.importance || 3) * 2;
              return (
                <g
                  key={n.id}
                  transform={`translate(${pos.x},${pos.y})`}
                  className="cursor-pointer"
                  onClick={() => onSelect(n.id)}
                >
                  <circle
                    r={r}
                    fill={selectedNode && n.id === selectedNode.id ? '#2563eb' : '#eff6ff'}
                    stroke="#2563eb"
                    strokeWidth={selectedNode && n.id === selectedNode.id ? 2.5 : 1.5}
                  />
                  <text textAnchor="middle" fontSize="12" fontWeight="600" fill="#1e293b">
                    {n.label.length > 12 ? `${n.label.slice(0, 11)}…` : n.label}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-slate-400">
            {graph.nodes.length > 0 && `Click a node to inspect it. Center: ${center.x}, ${center.y}`}
          </div>
        </div>

        <aside className="border-t border-slate-100 p-5 lg:border-l lg:border-t-0 dark:border-slate-800">
          {selectedNode ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">{selectedNode.label}</h3>
              {selectedNode.explanation && (
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedNode.explanation}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Page {selectedNode.page}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Importance {selectedNode.importance}/5
                </span>
              </div>
              <p className="text-xs text-slate-400">Connections:</p>
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {edges
                  .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                  .map((e, i) => {
                    const other = e.source === selectedNode.id ? e.target : e.source;
                    return (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <span>{byId[other]?.label || other}</span>
                        <span className="text-xs text-slate-400">{e.relation}</span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Select a concept node to see its explanation, importance, and connections.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function layout(count) {
  if (count === 0) return [];
  const cx = SVG_W / 2;
  const cy = SVG_H / 2;
  const radius = Math.min(SVG_W, SVG_H) / 2 - 90;
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
}
