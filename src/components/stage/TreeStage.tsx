import React from 'react';
import { ElementStatus } from '../../core/types';

export interface TreeNode {
  id: string;
  value: number;
  x: number;
  y: number;
  status: ElementStatus;
  leftId?: string;
  rightId?: string;
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
  const { nodes = [] } = state;

  if (nodes.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8 min-h-[340px]">
        <div className="flex flex-col items-center justify-center max-w-md w-full p-8 rounded-3xl bg-slate-950/70 border border-slate-800 shadow-2xl text-center">
          {/* Ghost Root Insertion Slot */}
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-cyan-500/50 bg-cyan-950/20 flex flex-col items-center justify-center mb-4 text-cyan-400 animate-pulse">
            <span className="text-xl">➕</span>
            <span className="text-[8px] font-mono font-bold tracking-wider">ROOT</span>
          </div>

          <h4 className="text-sm font-bold text-white font-mono mb-1">
            Tree Insertion Stage
          </h4>
          <p className="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
            Tree contains 0 nodes. Press <span className="text-emerald-400 font-bold">Line &gt;</span> (F10) or <span className="text-cyan-400 font-bold">Action ▷</span> to begin inserting elements into the root.
          </p>

          {state.targetValue !== undefined && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300">
              Next Value: <strong className="text-white">{state.targetValue}</strong>
            </div>
          )}
        </div>
      </div>
    );
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4 overflow-auto min-h-[340px]">
      <div
        className={`relative transition-all duration-500 ${
          projection === 'isometric' ? 'stage-isometric py-8' : 'stage-flat'
        }`}
        style={{ width: '560px', height: '300px' }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map((node) => {
            const links = [];
            if (node.leftId && nodeMap.has(node.leftId)) {
              const left = nodeMap.get(node.leftId)!;
              links.push(
                <path
                  key={`${node.id}-${left.id}`}
                  d={`M ${node.x} ${node.y} C ${node.x} ${(node.y + left.y) / 2}, ${left.x} ${
                    (node.y + left.y) / 2
                  }, ${left.x} ${left.y}`}
                  stroke="#334155"
                  strokeWidth="2"
                  fill="none"
                />
              );
            }
            if (node.rightId && nodeMap.has(node.rightId)) {
              const right = nodeMap.get(node.rightId)!;
              links.push(
                <path
                  key={`${node.id}-${right.id}`}
                  d={`M ${node.x} ${node.y} C ${node.x} ${(node.y + right.y) / 2}, ${right.x} ${
                    (node.y + right.y) / 2
                  }, ${right.x} ${right.y}`}
                  stroke="#334155"
                  strokeWidth="2"
                  fill="none"
                />
              );
            }
            return links;
          })}
        </svg>

        {/* Render Nodes */}
        {nodes.map((node) => {
          let bgClass = 'bg-[#1E293B] border-[#334155] text-slate-200';
          let ringClass = '';

          switch (node.status) {
            case 'active':
            case 'comparing':
              bgClass = 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]';
              ringClass = 'ring-4 ring-[#F59E0B]/30';
              break;
            case 'sorted':
              bgClass = 'bg-[#10B981]/25 border-[#10B981] text-[#10B981]';
              ringClass = 'ring-4 ring-[#10B981]/30';
              break;
            case 'pivot':
              bgClass = 'bg-[#8B5CF6]/25 border-[#8B5CF6] text-[#A78BFA]';
              ringClass = 'ring-4 ring-[#8B5CF6]/30';
              break;
          }

          return (
            <div
              key={node.id}
              style={{
                left: `${node.x - 20}px`,
                top: `${node.y - 20}px`,
              }}
              className={`absolute w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold shadow-md transition-all duration-300 ${bgClass} ${ringClass}`}
            >
              {node.value}
            </div>
          );
        })}
      </div>
    </div>
  );
};
