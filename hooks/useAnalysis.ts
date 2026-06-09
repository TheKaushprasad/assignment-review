'use client';

import { useState } from 'react';
import { AnalysisReport, ProgressEvent } from '@/lib/types';

type Status = 'idle' | 'loading' | 'complete' | 'error';

export function useAnalysis() {
  const [status, setStatus] = useState<Status>('idle');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [progressEvent, setProgressEvent] = useState<ProgressEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyse = async (assignmentText: string, submissionText: string, jdText: string) => {
    setStatus('loading');
    setReport(null);
    setProgressEvent(null);
    setError(null);

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_text: assignmentText,
          submission_text: submissionText,
          jd_text: jdText,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      // Use a local flag — reading `status` here would be a stale closure value
      let receivedFinalEvent = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === 'progress') {
              setProgressEvent(event as ProgressEvent);
            } else if (event.type === 'complete') {
              setReport(event.report as AnalysisReport);
              setStatus('complete');
              receivedFinalEvent = true;
            } else if (event.type === 'error') {
              setError(event.message);
              setStatus('error');
              receivedFinalEvent = true;
            }
          } catch {
            // Ignore malformed SSE lines
          }
        }
      }

      if (!receivedFinalEvent) {
        setStatus('error');
        setError('Connection closed unexpectedly. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setReport(null);
    setProgressEvent(null);
    setError(null);
  };

  return { status, report, progressEvent, error, analyse, reset };
}
