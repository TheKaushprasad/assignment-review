import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';
import { openai, ORCHESTRATOR_MODEL, TOOL_DEFINITIONS } from './openai';
import { executeTool } from './toolExecutor';
import { AnalysisReport, ProgressEvent } from './types';
import { MAX_AGENT_ITERATIONS, STEP_LABELS } from './constants';

export type OnProgress = (event: ProgressEvent) => void;

function loadWorkflow(): string {
  try {
    const workflowPath = join(process.cwd(), '..', 'workflows', 'evaluate_pm_assignment.md');
    return readFileSync(workflowPath, 'utf-8');
  } catch {
    return `You are a Senior PM evaluator. Evaluate the PM assignment submission against the provided Job Description.

You have these tools available — use them in whatever order produces the most rigorous evaluation:
- extract_jd_requirements: parse the JD into structured signals (call this before scoring)
- score_pm_dimensions: score all six PM dimensions against the submission
- detect_frameworks: identify which PM frameworks the candidate used or missed
- identify_strengths: surface evidence-backed strengths
- flag_red_flags: identify weaknesses, vague language, and gaps
- generate_rewrites: generate before/after rewrites (only if any dimension scored below 6)
- self_critique: audit your scoring for consistency and bias; if you find significant issues, re-score before compiling
- compile_report: assemble the final JSON report (this must be your last tool call)

Adapt your plan as you learn from each result. compile_report must come last.`;
  }
}

export async function runAgentLoop(
  jdText: string,
  submissionText: string,
  assignmentText: string,
  onProgress: OnProgress,
): Promise<AnalysisReport> {
  const systemPrompt = loadWorkflow();

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: `Please evaluate this PM assignment submission.

=== JOB DESCRIPTION ===
${jdText || '(No JD provided — use generic PM evaluation criteria)'}

=== COMPANY ASSIGNMENT ===
${assignmentText || '(No assignment brief provided)'}

=== CANDIDATE SUBMISSION ===
${submissionText}`,
    },
  ];

  let iterations = 0;
  let finalReport: AnalysisReport | null = null;
  let toolCallCount = 0;

  while (iterations < MAX_AGENT_ITERATIONS) {
    iterations++;

    const response = await openai.chat.completions.create({
      model: ORCHESTRATOR_MODEL,
      messages,
      tools: TOOL_DEFINITIONS,
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    const message = choice.message;

    // Add assistant turn to history
    messages.push({
      role: 'assistant',
      content: message.content,
      tool_calls: message.tool_calls,
    });

    // No tool calls → model is done
    if (!message.tool_calls || message.tool_calls.length === 0) {
      break;
    }

    // Execute each tool call (only function-type calls are executable)
    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== 'function') continue;

      toolCallCount++;

      onProgress({
        type: 'progress',
        step: toolCall.function.name,
        label: STEP_LABELS[toolCall.function.name] ?? toolCall.function.name,
        progress: toolCallCount,
        total: Object.keys(STEP_LABELS).length,
      });

      let toolResult: unknown;
      let isError = false;

      try {
        const input = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
        toolResult = await executeTool(toolCall.function.name, input);

        if (toolCall.function.name === 'compile_report') {
          finalReport = toolResult as AnalysisReport;
        }
      } catch (err) {
        isError = true;
        toolResult = { error: err instanceof Error ? err.message : String(err) };
      }

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      });
    }

    if (choice.finish_reason === 'stop' && finalReport) {
      break;
    }
  }

  if (!finalReport) {
    throw new Error('Agent loop completed without producing a report. Try again.');
  }

  return finalReport;
}
