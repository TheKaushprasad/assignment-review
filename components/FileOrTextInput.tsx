'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';

interface FileOrTextInputProps {
  label: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
  rows?: number;
}

type Mode = 'text' | 'file';

interface FileInfo {
  name: string;
  wordCount: number;
}

export default function FileOrTextInput({
  label,
  required,
  hint,
  placeholder,
  value,
  onChange,
  disabled,
  rows = 8,
}: FileOrTextInputProps) {
  const [mode, setMode] = useState<Mode>('text');
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = '.pdf,.doc,.docx,.ppt,.pptx';

  async function handleFile(file: File) {
    setIsExtracting(true);
    setExtractError(null);
    setFileInfo(null);
    onChange('');

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/extract', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) {
        setExtractError(data.error ?? 'Extraction failed');
        return;
      }

      onChange(data.text as string);
      setFileInfo({ name: data.filename as string, wordCount: data.wordCount as number });
    } catch {
      setExtractError('Could not reach extraction service. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  }

  function onFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function clearFile() {
    setFileInfo(null);
    setExtractError(null);
    onChange('');
  }

  const wc = value.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {hint && <span className="text-gray-400 font-normal ml-1">{hint}</span>}
        </label>

        <div className="flex rounded-md border border-gray-300 overflow-hidden text-xs font-medium">
          <button
            type="button"
            onClick={() => { setMode('text'); clearFile(); }}
            disabled={disabled}
            className={`px-3 py-1 transition-colors ${
              mode === 'text'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Paste text
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            disabled={disabled}
            className={`px-3 py-1 transition-colors border-l border-gray-300 ${
              mode === 'file'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Upload file
          </button>
        </div>
      </div>

      {mode === 'text' ? (
        <div>
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
          />
          <p className="mt-1 text-xs text-gray-400 text-right">{wc} words</p>
        </div>
      ) : (
        <div>
          {fileInfo ? (
            <div className="flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3">
              <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{fileInfo.name}</p>
                <p className="text-xs text-gray-500">{fileInfo.wordCount.toLocaleString()} words extracted</p>
              </div>
              <button
                type="button"
                onClick={clearFile}
                disabled={disabled}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors shrink-0"
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => !disabled && inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 cursor-pointer transition-colors ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isExtracting ? (
                <div className="flex items-center gap-2 text-sm text-indigo-600">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Extracting text…
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm text-gray-600 font-medium">
                    Drop file here or <span className="text-indigo-600">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, PPT, PPTX — max 10 MB</p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={onFileInputChange}
                disabled={disabled || isExtracting}
                className="sr-only"
              />
            </div>
          )}

          {extractError && (
            <p className="mt-2 text-xs text-red-600">{extractError}</p>
          )}
        </div>
      )}
    </div>
  );
}
