'use client';

import { FormEvent, useState } from 'react';
import FileOrTextInput from './FileOrTextInput';

interface InputFormProps {
  onSubmit: (assignmentText: string, submissionText: string, jdText: string) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [assignment, setAssignment] = useState('');
  const [submission, setSubmission] = useState('');
  const [jd, setJd] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!assignment.trim() || !submission.trim()) return;
    onSubmit(assignment, submission, jd);
  };

  const canSubmit = !isLoading && assignment.trim().length > 0 && submission.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FileOrTextInput
        label="Company Assignment"
        required
        placeholder="Paste the assignment brief given to the candidate…"
        value={assignment}
        onChange={setAssignment}
        disabled={isLoading}
        rows={6}
      />

      <FileOrTextInput
        label="PM Submission"
        required
        placeholder="Paste the candidate's PM assignment response…"
        value={submission}
        onChange={setSubmission}
        disabled={isLoading}
        rows={12}
      />

      <FileOrTextInput
        label="Job Description"
        hint="(optional — improves evaluation relevance)"
        placeholder="Paste the PM job description here…"
        value={jd}
        onChange={setJd}
        disabled={isLoading}
        rows={6}
      />

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-sm transition-colors"
      >
        {isLoading ? 'Analysing…' : 'Evaluate Submission'}
      </button>
    </form>
  );
}
