'use client';

import { useState } from 'react';
import { Rewrite } from '@/lib/types';

function RewriteBlock({ rewrite }: { rewrite: Rewrite }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-800">{rewrite.section}</span>
        <span className="text-gray-400 text-xs ml-2">{expanded ? '▲ hide' : '▼ show rewrite'}</span>
      </button>
      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="p-4 bg-red-50">
            <p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">Original</p>
            <p className="text-xs text-gray-700 leading-relaxed">{rewrite.original}</p>
          </div>
          <div className="p-4 bg-emerald-50">
            <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wide">Improved</p>
            <p className="text-xs text-gray-700 leading-relaxed">{rewrite.rewritten}</p>
          </div>
        </div>
      )}
      {expanded && rewrite.why && (
        <div className="px-4 py-2 bg-blue-50 border-t border-gray-200">
          <p className="text-xs text-blue-700"><span className="font-semibold">Why: </span>{rewrite.why}</p>
        </div>
      )}
    </div>
  );
}

export default function RewritePanel({ rewrites }: { rewrites: Rewrite[] }) {
  if (rewrites.length === 0) return null;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 text-sm mb-3">Suggested Rewrites</h3>
      <div className="space-y-3">
        {rewrites.map((r, i) => <RewriteBlock key={i} rewrite={r} />)}
      </div>
    </div>
  );
}
