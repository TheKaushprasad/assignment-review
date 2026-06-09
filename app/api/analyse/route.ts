import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { runAgentLoop } from '@/lib/agent';
import { ProgressEvent } from '@/lib/types';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function encode(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`);
}

export async function POST(req: NextRequest) {
  let jd_text: string;
  let submission_text: string;
  let assignment_text: string;

  try {
    const body = await req.json();
    jd_text = (body.jd_text ?? '').trim();
    submission_text = (body.submission_text ?? '').trim();
    assignment_text = (body.assignment_text ?? '').trim();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!submission_text) {
    return new Response(JSON.stringify({ error: 'submission_text is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  };

  // Run the agent loop in background, streaming progress
  (async () => {
    try {
      const onProgress = async (event: ProgressEvent) => {
        await writer.write(encode(event));
      };

      const report = await runAgentLoop(jd_text, submission_text, assignment_text, onProgress);

      await writer.write(encode({ type: 'complete', report }));
    } catch (err) {
      let message = 'Analysis failed';
      if (err instanceof OpenAI.APIError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      await writer.write(encode({ type: 'error', message }));
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, { headers });
}
