import { NextRequest } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function extractPdf(buffer: Buffer): Promise<string> {
  // Import the lib directly to bypass index.js, which runs a readFileSync test in debug
  // mode when module.parent is null (Node.js 22+). No exports field in v1.1.1 so this works.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse/lib/pdf-parse.js') as (buf: Buffer) => Promise<{ text: string }>;
  const result = await pdfParse(buffer);
  return result.text;
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractPptx(buffer: Buffer): Promise<string> {
  const { parseOffice } = await import('officeparser');
  const result = await parseOffice(buffer, { outputErrorToConsole: false });
  return result as unknown as string;
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return Response.json({ error: 'Missing file field' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'File exceeds 10 MB limit' }, { status: 400 });
  }

  const filename = file.name.toLowerCase();
  const ext = filename.split('.').pop() ?? '';
  const allowed = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];

  if (!allowed.includes(ext)) {
    return Response.json(
      { error: `Unsupported file type .${ext}. Allowed: PDF, DOC, DOCX, PPT, PPTX` },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let text: string;
  try {
    if (ext === 'pdf') {
      text = await extractPdf(buffer);
    } else if (ext === 'docx' || ext === 'doc') {
      text = await extractDocx(buffer);
    } else {
      text = await extractPptx(buffer);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed';
    return Response.json({ error: `Could not parse file: ${message}` }, { status: 422 });
  }

  text = text.trim();
  if (!text) {
    return Response.json({ error: 'No text could be extracted from this file' }, { status: 422 });
  }

  return Response.json({ text, filename: file.name, wordCount: wordCount(text) });
}
