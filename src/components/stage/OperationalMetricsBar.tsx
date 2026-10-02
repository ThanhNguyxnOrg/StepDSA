import React from 'react';
import { OperationalMetrics } from '../../core/types';
import { GitCompare, ArrowLeftRight, Eye, Database } from 'lucide-react';

export interface OperationalMetricsBarProps {
  metrics: OperationalMetrics;
  complexity?: string;
  className?: string;
}

export const OperationalMetricsBar: React.FC<OperationalMetricsBarProps> = ({
  metrics,
  complexity,
  className = '',
}) => {
  return (
    <div
      data-testid="operational-metrics-bar"
      className={`flex items-center gap-2 sm:gap-3 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md shadow-sm text-[11px] font-mono select-none ${className}`}
    >
      {/* Comparisons */}
      <div className="flex items-center gap-1.5 text-amber-400" title="Total comparisons performed">
        <GitCompare className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-slate-400 hidden sm:inline">Compares:</span>
        <span className="font-bold px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-amber-300">
          {metrics.comparisons}
        </span>
      </div>

      {/* Swaps / Writes */}
      <div className="flex items-center gap-1.5 text-rose-400" title="Total swaps or array writes">
        <ArrowLeftRight className="w-3.5 h-3.5 text-rose-400" />
        <span className="text-slate-400 hidden sm:inline">Swaps:</span>
        <span className="font-bold px-1.5 py-0.5 rounded bg-rose-400/10 border border-rose-400/20 text-rose-300">
          {metrics.swaps}
        </span>
      </div>

      {/* Array Accesses */}
      <div className="flex items-center gap-1.5 text-cyan-400" title="Total element reads/accesses">
        <Eye className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-400 hidden sm:inline">Accesses:</span>
        <span className="font-bold px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-300">
          {metrics.accesses}
        </span>
      </div>

      {/* Hash Lookups (rendered if > 0) */}
      {metrics.lookups > 0 && (
        <div className="flex items-center gap-1.5 text-purple-400" title="Total map/set lookups">
          <Database className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400 hidden sm:inline">Lookups:</span>
          <span className="font-bold px-1.5 py-0.5 rounded bg-purple-400/10 border border-purple-400/20 text-purple-300">
            {metrics.lookups}
          </span>
        </div>
      )}

      {/* Theoretical Average Complexity Indicator */}
      {complexity && (
        <div className="ml-auto pl-2 border-l border-slate-800 text-slate-400 text-[10px] hidden md:flex items-center gap-1">
          <span>Avg:</span>
          <span className="text-emerald-400 font-bold">{complexity}</span>
        </div>
      )}
    </div>
  );
};
