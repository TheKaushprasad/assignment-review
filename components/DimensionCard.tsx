'use client';

import { DimensionScore } from '@/lib/types';

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 7 ? 'bg-emerald-500' : score >= 5 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold w-8 text-right ${score >= 7 ? 'text-emerald-700' : score >= 5 ? 'text-amber-700' : 'text-red-700'}`}>
        {score}/10
      </span>
    </div>
  );
}

export default function DimensionCard({ dimension }: { dimension: DimensionScore }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div>
        <h3 className="font-semibold text-gray-900 text-sm mb-2">{dimension.dimension}</h3>
        <ScoreBar score={dimension.score} />
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{dimension.rationale}</p>
      {dimension.evidence_quotes.length > 0 && (
        <blockquote className="border-l-2 border-gray-300 pl-3 text-xs text-gray-500 italic leading-relaxed line-clamp-3">
          &ldquo;{dimension.evidence_quotes[0]}&rdquo;
        </blockquote>
      )}
    </div>
  );
}
