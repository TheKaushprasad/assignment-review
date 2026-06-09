import { DimensionScore, Rewrite, RewritesResult } from '../types';
import { getOpenAIClient, REWRITE_MODEL } from '../openai';

const REWRITE_HINTS: Record<string, string> = {
  'Problem Framing': 'Focus on clearly defining the user problem, root causes, and why this matters before proposing any solution.',
  'User Research': 'Ground the statement in specific user research, personas, or customer insights. Mention how you would gather or have gathered user data.',
  'Metrics': 'Define specific, measurable KPIs, a north star metric, and guardrail metrics. Include realistic targets.',
  'Prioritization': 'Use a named framework (RICE, MoSCoW, Kano) or explicit criteria to justify why this is prioritized over alternatives.',
  'Execution': 'Outline a phased roadmap with milestones, team dependencies, risks, and a realistic timeline.',
  'Communication': 'Restructure for clarity: start with the conclusion, use headers/bullets, eliminate hedging language, and be specific.',
};

function extractWeakSection(text: string, dimension: string): string {
  const patterns: Record<string, RegExp[]> = {
    'Problem Framing': [/(?:problem|challenge|issue|opportunity)[^.]{20,200}/gi],
    'User Research': [/(?:user|customer|people|audience)[^.]{20,200}/gi],
    'Metrics': [/(?:success|measure|goal|metric|kpi|result)[^.]{20,200}/gi],
    'Prioritization': [/(?:prioriti|first|focus|phase|mvp)[^.]{20,200}/gi],
    'Execution': [/(?:build|launch|ship|implement|roadmap|plan)[^.]{20,200}/gi],
    'Communication': [],
  };

  const dimPatterns = patterns[dimension] || [];
  for (const pattern of dimPatterns) {
    const re = new RegExp(pattern.source, pattern.flags);
    const match = re.exec(text);
    if (match) return match[0].trim().slice(0, 300);
  }

  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30);
  return paragraphs[0]?.trim().slice(0, 300) || text.slice(0, 300);
}

export async function generateRewrites(input: {
  submission_text: string;
  scores: DimensionScore[];
  rewrite_threshold: number;
}): Promise<RewritesResult> {
  const { submission_text, scores, rewrite_threshold } = input;

  const weakDimensions = scores.filter(s => s.score < rewrite_threshold);
  if (weakDimensions.length === 0) return { rewrites: [] };

  const client = getOpenAIClient();
  const rewrites: Rewrite[] = [];

  for (const dim of weakDimensions.slice(0, 3)) {
    const original = extractWeakSection(submission_text, dim.dimension);
    const hint = REWRITE_HINTS[dim.dimension] || `Improve the ${dim.dimension} section.`;

    try {
      const response = await client.chat.completions.create({
        model: REWRITE_MODEL,
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: `You are a Senior PM coach. Rewrite the following section to improve the candidate's score on "${dim.dimension}" (currently ${dim.score}/10).

Hint: ${hint}

Original section:
"${original}"

Write ONLY the improved version (2-4 sentences). Be specific, concrete, and professional. Do not explain what you changed.`,
          },
        ],
      });

      const rewritten = response.choices[0].message.content?.trim() ?? original;

      rewrites.push({
        section: dim.dimension,
        original,
        rewritten,
        why: hint,
      });
    } catch {
      rewrites.push({
        section: dim.dimension,
        original,
        rewritten: `[Rewrite unavailable] ${hint}`,
        why: hint,
      });
    }
  }

  return { rewrites };
}
