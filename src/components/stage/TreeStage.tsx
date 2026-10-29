import React from 'react';
import { ElementStatus } from '../../core/types';
import { resolveTreeNodesOverlap } from '../../utils/stageLayout';

export interface TreeNode {
  id: string;
  value: number;
  x: number;
  y: number;
  status: ElementStatus;
  leftId?: string;
  rightId?: string;
  label?: string;
}

export interface TreeStageState {
  nodes: TreeNode[];
  targetValue?: number;
  message?: string;
}

interface TreeStageProps {
  state: TreeStageState;
  projection: '2d' | 'isometric';
}

export const TreeStage: React.FC<TreeStageProps> = ({ state, projection }) => {
  const { nodes = [], targetValue, message } = state;
  const [inspectedNodeId, setInspectedNodeId] = React.useState<string | null>(null);

  const resolvedLayout = React.useMemo(
    () => resolveTreeNodesOverlap(nodes, 58, 600, 68),
    [nodes]
  );

  if (nodes.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-6 min-h-[300px]">
        <div className="flex flex-col items-center justify-center max-w-md w-full p-6 rounded-2xl bg-[#111827] border border-[#1F293D] shadow-xl text-center">
          <div className="w-14 h-14 rounded-xl border-2 border-dashed border-cyan-500/50 bg-cyan-950/20 flex flex-col items-center justify-center mb-3 text-cyan-400">
            <span className="text-lg font-mono font-bold">+</span>
            <span className="text-[9px] font-mono font-bold tracking-wider">ROOT</span>
          </div>
          <h4 className="text-sm font-bold text-white font-mono mb-1">
            Tree Construction Stage
          </h4>
          <p className="text-xs text-slate-400 font-sans mb-3 leading-relaxed">
            Tree currently has 0 nodes. Step forward (<strong className="text-emerald-400 font-mono">Line →</strong> or <strong className="text-cyan-400 font-mono">Action ⏭</strong>) to insert the root node.
          </p>
          {targetValue !== undefined && (
            <div className="px-3 py-1 rounded-lg bg-[#0B0F19] border border-[#1F293D] text-xs font-mono text-cyan-300">
              Next Value to Insert: <strong className="text-white tabular-nums">{targetValue}</strong>
            </div>
          )}
        </div>
      </div>
    );
  }

  const { nodes: layoutNodes, width, height } = resolvedLayout;
  const nodeMap = new Map(layoutNodes.map((n) => [n.id, n]));
  const inspectedNode = inspectedNodeId ? nodeMap.get(inspectedNodeId) : null;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-3 overflow-auto min-h-[300px] select-none">
      {/* Top Contextual HUD for Tree Operations & Node Inspection */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-2 px-3 py-1.5 rounded-xl bg-[#111827]/90 border border-[#1F293D] text-xs font-mono">
        {targetValue !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Active Value:</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold tabular-nums">
              {targetValue}
            </span>
          </div>
        )}
        {message && <span className="text-slate-300">{message}</span>}
        <span className="text-slate-500 text-[11px] tabular-nums">
          Nodes: {layoutNodes.length}
        </span>
        {inspectedNode && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#1F293D] text-[11px]">
            <span className="text-cyan-400 font-bold">Node {inspectedNode.value}</span>
            <span className="text-slate-500">({(inspectedNode.childRole || 'node').toUpperCase()})</span>
            {inspectedNode.leftId && nodeMap.get(inspectedNode.leftId) && (
              <span className="text-sky-300">
                L:{nodeMap.get(inspectedNode.leftId)!.value}
              </span>
            )}
            {inspectedNode.rightId && nodeMap.get(inspectedNode.rightId) && (
              <span className="text-emerald-300">
                R:{nodeMap.get(inspectedNode.rightId)!.value}
              </span>
            )}
          </div>
        )}
      </div>

      <div
        className={`relative transition-all duration-300 ${
          projection === 'isometric' ? 'stage-isometric py-6' : 'stage-flat'
        }`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        >
          {layoutNodes.map((node) => {
            const links = [];
            if (node.leftId && nodeMap.has(node.leftId)) {
              const left = nodeMap.get(node.leftId)!;
              const midX = (node.x + left.x) / 2;
              const midY = (node.y + left.y) / 2;
              const isHighlighted =
                left.status === 'comparing' ||
                left.status === 'active' ||
                left.status === 'sorted';
              const pathD = `M ${node.x} ${node.y} C ${node.x} ${midY}, ${left.x} ${midY}, ${left.x} ${left.y}`;
              links.push(
                <g key={`${node.id}-${left.id}`}>
                  <path
                    d={pathD}
                    stroke={isHighlighted ? '#06B6D4' : '#334155'}
                    strokeWidth={isHighlighted ? '2.5' : '2'}
                    strokeOpacity={isHighlighted ? 0.35 : 1}
                    fill="none"
                  />
                  {isHighlighted && (
                    <path
                      d={pathD}
                      stroke="#38BDF8"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      fill="none"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="20"
                        to="0"
                        dur="0.85s"
                        repeatCount="indefinite"
                      />
                    </path>
                  )}
                  <rect
                    x={midX - 8}
                    y={midY - 8}
                    width={16}
                    height={15}
                    rx={4}
                    fill="#0B0F19"
                    stroke={isHighlighted ? '#06B6D4' : '#1E293B'}
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill="#38BDF8"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    L
                  </text>
                </g>
              );
            }
            if (node.rightId && nodeMap.has(node.rightId)) {
              const right = nodeMap.get(node.rightId)!;
              const midX = (node.x + right.x) / 2;
              const midY = (node.y + right.y) / 2;
              const isHighlighted =
                right.status === 'comparing' ||
                right.status === 'active' ||
                right.status === 'sorted';
              const pathD = `M ${node.x} ${node.y} C ${node.x} ${midY}, ${right.x} ${midY}, ${right.x} ${right.y}`;
              links.push(
                <g key={`${node.id}-${right.id}`}>
                  <path
                    d={pathD}
                    stroke={isHighlighted ? '#10B981' : '#334155'}
                    strokeWidth={isHighlighted ? '2.5' : '2'}
                    strokeOpacity={isHighlighted ? 0.35 : 1}
                    fill="none"
                  />
                  {isHighlighted && (
                    <path
                      d={pathD}
                      stroke="#34D399"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      fill="none"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="20"
                        to="0"
                        dur="0.85s"
                        repeatCount="indefinite"
                      />
                    </path>
                  )}
                  <rect
                    x={midX - 8}
                    y={midY - 8}
                    width={16}
                    height={15}
                    rx={4}
                    fill="#0B0F19"
                    stroke={isHighlighted ? '#10B981' : '#1E293B'}
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill="#34D399"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    R
                  </text>
                </g>
              );
            }
            return links;
          })}
        </svg>

        {/* Render Non-Overlapping Tree Nodes */}
        {layoutNodes.map((node) => {
          let bgClass = 'bg-[#1E293B] border-[#475569] text-slate-100';
          let ringClass = '';

          switch (node.status) {
            case 'active':
            case 'comparing':
              bgClass = 'bg-[#F59E0B]/25 border-[#F59E0B] text-amber-200';
              ringClass = 'ring-4 ring-[#F59E0B]/25 scale-105';
              break;
            case 'swapping':
              bgClass = 'bg-[#F43F5E]/25 border-[#F43F5E] text-rose-200';
              ringClass = 'ring-4 ring-[#F43F5E]/25 scale-105';
              break;
            case 'sorted':
            case 'selected':
              bgClass = 'bg-[#10B981]/25 border-[#10B981] text-emerald-200';
              ringClass = 'ring-4 ring-[#10B981]/25';
              break;
            case 'pivot':
              bgClass = 'bg-[#8B5CF6]/25 border-[#8B5CF6] text-purple-200';
              ringClass = 'ring-4 ring-[#8B5CF6]/25';
              break;
          }

          const showTargetRelation =
            (node.status === 'comparing' || node.status === 'active') &&
            targetValue !== undefined &&
            targetValue !== node.value;

          return (
            <div
              key={node.id}
              onMouseEnter={() => setInspectedNodeId(node.id)}
              onMouseLeave={() => setInspectedNodeId((prev) => (prev === node.id ? null : prev))}
              onClick={() => setInspectedNodeId((prev) => (prev === node.id ? null : node.id))}
              style={{
                left: `${node.x - 21}px`,
                top: `${node.y - 21}px`,
              }}
              className={`absolute w-[42px] h-[42px] rounded-full border-2 flex flex-col items-center justify-center font-mono text-xs font-bold tabular-nums shadow-lg transition-all duration-200 cursor-pointer ${bgClass} ${ringClass}`}
            >
              {node.childRole === 'root' && (
                <span className="absolute -top-4 px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-[8px] font-mono text-cyan-400 uppercase tracking-wider leading-none">
                  ROOT
                </span>
              )}
              <span>{node.value}</span>
              {showTargetRelation && (
                <span
                  className={`absolute -bottom-4 px-1.5 py-0.2 rounded bg-[#0B0F19] border text-[8px] font-mono whitespace-nowrap leading-none ${
                    targetValue! < node.value
                      ? 'border-cyan-500/40 text-cyan-300'
                      : 'border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {targetValue! < node.value ? `${targetValue}<${node.value} → L` : `${targetValue}>${node.value} → R`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
