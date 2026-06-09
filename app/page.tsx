'use client';

import { useAnalysis } from '@/hooks/useAnalysis';
import InputForm from '@/components/InputForm';
import ReportView from '@/components/ReportView';
import LoadingState from '@/components/LoadingState';

export default function Home() {
  const { status, report, progressEvent, error, analyse, reset } = useAnalysis();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">PM Assignment Analyser</h1>
          <p className="mt-2 text-gray-500 text-sm">
            AI-powered evaluation of PM assignment submissions against a Job Description
          </p>
        </header>

        {status === 'idle' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <InputForm onSubmit={(assignment, submission, jd) => analyse(assignment, submission, jd)} isLoading={false} />
          </div>
        )}

        {status === 'loading' && (
          <LoadingState event={progressEvent} />
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-4">
            <p className="text-red-700 font-semibold">Analysis failed</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={reset}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {status === 'complete' && report && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <ReportView report={report} onReset={reset} />
          </div>
        )}
      </div>
    </main>
  );
}
