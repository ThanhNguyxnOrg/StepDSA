import React from 'react';
import { OperationalMetrics } from '../../core/types';
import { formatCompactBigO } from '../dashboard/DashboardView';

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
  const compactComplexity = complexity ? formatCompactBigO(complexity) : null;

  return (
    <div
      data-testid="operational-metrics-bar"
      className={`flex items-center gap-3 px-2.5 py-1 rounded-lg bg-[#0B0F19] border border-[#1F293D] text-[11px] font-mono tabular-nums select-none ${className}`}
    >
      <div className="flex items-center gap-1" title="Total comparisons performed">
        <span className="text-slate-400">Compares</span>
        <strong className="text-amber-400 font-bold">{metrics.comparisons}</strong>
      </div>

      <span className="text-slate-700" aria-hidden="true">
        ·
      </span>

      <div className="flex items-center gap-1" title="Total swaps or array writes">
        <span className="text-slate-400">Swaps</span>
        <strong className="text-rose-400 font-bold">{metrics.swaps}</strong>
      </div>

      <span className="text-slate-700" aria-hidden="true">
        ·
      </span>

      <div className="flex items-center gap-1" title="Total element reads/accesses">
        <span className="text-slate-400">Accesses</span>
        <strong className="text-cyan-400 font-bold">{metrics.accesses}</strong>
      </div>

      {metrics.lookups > 0 && (
        <>
          <span className="text-slate-700" aria-hidden="true">
            ·
          </span>
          <div className="flex items-center gap-1" title="Total map/set lookups">
            <span className="text-slate-400">Lookups</span>
            <strong className="text-purple-400 font-bold">{metrics.lookups}</strong>
          </div>
        </>
      )}

      {compactComplexity && (
        <div
          className="hidden xl:flex items-center gap-1 pl-2.5 border-l border-[#1F293D] text-slate-400"
          title={`Average Time Complexity: ${complexity}`}
        >
          <span>Avg</span>
          <strong className="text-[#10B981] font-bold">{compactComplexity}</strong>
        </div>
      )}
    </div>
  );
};
