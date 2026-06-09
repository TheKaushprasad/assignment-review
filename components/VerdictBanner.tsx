'use client';

import { Verdict } from '@/lib/types';

const VERDICT_CONFIG: Record<Verdict, { bg: string; text: string; border: string; label: string }> = {
  'Strong Hire': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300', label: '✓ Strong Hire' },
  'Hire': { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300', label: '✓ Hire' },
  'Borderline': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', label: '~ Borderline' },
  'No Hire': { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300', label: '✗ No Hire' },
};

export default function VerdictBanner({
  verdict,
  overallScore,
  summary,
}: {
  verdict: Verdict;
  overallScore: number;
  summary: string;
}) {
  const config = VERDICT_CONFIG[verdict];
  return (
    <div className={`rounded-xl border-2 ${config.border} ${config.bg} p-6`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-2xl font-bold ${config.text}`}>{config.label}</span>
        <span className={`text-3xl font-black ${config.text}`}>{overallScore}<span className="text-lg font-normal">/10</span></span>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
    </div>
  );
}
