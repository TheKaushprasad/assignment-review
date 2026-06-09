'use client';

import { Strength } from '@/lib/types';

export default function StrengthList({ strengths }: { strengths: Strength[] }) {
  if (strengths.length === 0) return null;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 text-sm mb-3">Strengths</h3>
      <ul className="space-y-3">
        {strengths.map((s, i) => (
          <li key={i} className="space-y-1">
            <p className="text-sm font-medium text-emerald-800">{s.title}</p>
            <p className="text-xs text-gray-600">{s.description}</p>
            {s.quote && (
              <blockquote className="border-l-2 border-emerald-300 pl-2 text-xs text-gray-500 italic line-clamp-2">
                &ldquo;{s.quote}&rdquo;
              </blockquote>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
