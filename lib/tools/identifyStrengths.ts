import { DimensionScore, JdRequirements, Strength, StrengthsResult } from '../types';

const STRENGTH_TITLES: Record<string, string> = {
  'Problem Framing': 'Sharp problem definition',
  'User Research': 'User-centric thinking',
  'Metrics': 'Metrics-driven approach',
  'Prioritization': 'Clear prioritization',
  'Execution': 'Execution-ready thinking',
  'Communication': 'Clear communication',
};

const STRENGTH_DESCRIPTIONS: Record<string, (score: number) => string> = {
  'Problem Framing': (s) => s >= 9
    ? 'Demonstrates exceptional ability to define the problem space and identify root causes before proposing solutions.'
    : 'Shows solid problem framing with clear identification of user pain points.',
  'User Research': (s) => s >= 9
    ? 'Grounds every recommendation in real user insights — shows a deeply customer-obsessed mindset.'
    : 'Incorporates user perspective meaningfully into the analysis.',
  'Metrics': (s) => s >= 9
    ? 'Defines precise, measurable success criteria with north star metrics and guardrails — ready to track.'
    : 'Ties outcomes to specific metrics rather than vague improvement goals.',
  'Prioritization': (s) => s >= 9
    ? 'Makes explicit, well-reasoned trade-off decisions with clear criteria — shows senior PM judgment.'
    : 'Shows ability to prioritize and make clear-headed decisions under constraints.',
  'Execution': (s) => s >= 9
    ? 'Lays out a realistic, phased execution plan that accounts for dependencies and risks.'
    : 'Provides a credible path from idea to launch.',
  'Communication': (s) => s >= 9
    ? 'Submission is exceptionally well-structured, concise, and persuasive — reads like a polished doc.'
    : 'Well-organized and easy to follow.',
};

function extractBestQuote(text: string, dimension: string): string {
  const patterns: Record<string, RegExp> = {
    'Problem Framing': /(?:problem|root cause|pain point|challenge)[^.]{10,120}/i,
    'User Research': /(?:user|customer|research|interview)[^.]{10,120}/i,
    'Metrics': /(?:metric|kpi|measure|track|success)[^.]{10,120}/i,
    'Prioritization': /(?:prioriti|trade.off|phase|mvp|rank)[^.]{10,120}/i,
    'Execution': /(?:launch|roadmap|ship|phase|timeline)[^.]{10,120}/i,
    'Communication': /.{0,120}/,
  };
  const pattern = patterns[dimension];
  if (!pattern) return text.slice(0, 120);
  const match = pattern.exec(text);
  return match ? match[0].trim().slice(0, 150) : text.slice(0, 120);
}

export function identifyStrengths(input: {
  submission_text: string;
  scores: DimensionScore[];
  jd_requirements: JdRequirements;
}): StrengthsResult {
  const { submission_text, scores } = input;

  const highScores = scores.filter(s => s.score >= 7).sort((a, b) => b.score - a.score);

  const strengths: Strength[] = highScores.map(s => ({
    title: STRENGTH_TITLES[s.dimension] || s.dimension,
    description: (STRENGTH_DESCRIPTIONS[s.dimension] || (() => `Strong performance on ${s.dimension}`))(s.score),
    quote: s.evidence_quotes[0] || extractBestQuote(submission_text, s.dimension),
  }));

  return { strengths };
}
