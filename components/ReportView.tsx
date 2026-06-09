'use client';

import { AnalysisReport } from '@/lib/types';
import VerdictBanner from './VerdictBanner';
import DimensionCard from './DimensionCard';
import FrameworkBadge from './FrameworkBadge';
import StrengthList from './StrengthList';
import RedFlagList from './RedFlagList';
import RewritePanel from './RewritePanel';
import SelfCritiqueNote from './SelfCritiqueNote';

export default function ReportView({
  report,
  onReset,
}: {
  report: AnalysisReport;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Evaluation Report</h2>
        <button
          onClick={onReset}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← New evaluation
        </button>
      </div>

      <VerdictBanner
        verdict={report.verdict}
        overallScore={report.overall_score}
        summary={report.summary}
      />

      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Dimension Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.dimensions.map(d => (
            <DimensionCard key={d.dimension} dimension={d} />
          ))}
        </div>
      </div>

      <FrameworkBadge frameworks={report.frameworks} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StrengthList strengths={report.strengths} />
        <RedFlagList flags={report.red_flags} />
      </div>

      <RewritePanel rewrites={report.rewrites} />

      <SelfCritiqueNote critique={report.self_critique} />

      <p className="text-xs text-gray-400 text-right">
        Evaluated {new Date(report.metadata.evaluated_at).toLocaleString()} · {report.metadata.model}
      </p>
    </div>
  );
}
