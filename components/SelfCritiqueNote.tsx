'use client';

import { useState } from 'react';
import { SelfCritiqueResult } from '@/lib/types';

export default function SelfCritiqueNote({ critique }: { critique: SelfCritiqueResult }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition-colors rounded-lg"
      >
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Agent Self-Critique</span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-gray-600 leading-relaxed">{critique.critique}</p>
          {critique.bias_detected !== 'none' && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
              Bias detected: <span className="font-semibold capitalize">{critique.bias_detected}</span>
              {critique.adjusted_scores && ' — scores have been adjusted.'}
            </p>
          )}
          {critique.missed_signals.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Potentially missed signals:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {critique.missed_signals.map((s, i) => (
                  <li key={i} className="text-xs text-gray-500">{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
