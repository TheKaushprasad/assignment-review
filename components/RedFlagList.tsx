'use client';

import { RedFlag, Severity } from '@/lib/types';

const SEVERITY_CONFIG: Record<Severity, { dot: string; bg: string; text: string }> = {
  high: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-800' },
  medium: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-800' },
  low: { dot: 'bg-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-800' },
};

export default function RedFlagList({ flags }: { flags: RedFlag[] }) {
  if (flags.length === 0) return null;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 text-sm mb-3">Red Flags</h3>
      <ul className="space-y-2">
        {flags.map((f, i) => {
          const cfg = SEVERITY_CONFIG[f.severity];
          return (
            <li key={i} className={`rounded-lg p-3 ${cfg.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <span className={`text-xs font-semibold ${cfg.text}`}>{f.category}</span>
                <span className={`text-xs uppercase tracking-wide ${cfg.text} opacity-60 ml-auto`}>{f.severity}</span>
              </div>
              <p className="text-xs text-gray-600 ml-4">{f.description}</p>
              {f.quote && (
                <blockquote className="ml-4 mt-1 border-l-2 border-gray-300 pl-2 text-xs text-gray-400 italic line-clamp-2">
                  &ldquo;{f.quote}&rdquo;
                </blockquote>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
