'use client';

import { ProgressEvent } from '@/lib/types';

export default function LoadingState({ event }: { event: ProgressEvent | null }) {
  const steps = [
    'Extracting JD requirements',
    'Scoring PM dimensions',
    'Detecting frameworks',
    'Identifying strengths',
    'Flagging red flags',
    'Generating rewrites',
    'Running self-critique',
    'Compiling report',
  ];

  const currentIdx = event ? event.progress - 1 : -1;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-12">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <span className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Analysing submission&hellip;</h2>
        {event && (
          <p className="text-sm text-indigo-600 font-medium">{event.label}</p>
        )}
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-indigo-50' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {done ? '✓' : i + 1}
              </span>
              <span className={`text-sm ${done ? 'text-gray-400 line-through' : active ? 'text-indigo-700 font-medium' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${event ? (event.progress / event.total) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
