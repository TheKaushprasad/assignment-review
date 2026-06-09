'use client';

import { FrameworksResult } from '@/lib/types';

export default function FrameworkBadge({ frameworks }: { frameworks: FrameworksResult }) {
  if (frameworks.frameworks_used.length === 0 && frameworks.frameworks_missing.length === 0) return null;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 text-sm mb-3">PM Frameworks</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        {frameworks.frameworks_used.map(f => (
          <span key={f} className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
            {f}
          </span>
        ))}
        {frameworks.frameworks_missing.map(f => (
          <span key={f} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full line-through">
            {f}
          </span>
        ))}
      </div>
      {frameworks.notes && (
        <p className="text-xs text-gray-500 mt-2">{frameworks.notes}</p>
      )}
    </div>
  );
}
