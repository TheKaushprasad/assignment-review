import { DimensionScore, JdRequirements, ScoresResult } from '../types';

interface ScoringSignals {
  positive: RegExp[];
  negative: RegExp[];
  quotes: RegExp[];
}

const DIMENSION_SIGNALS: Record<string, ScoringSignals> = {
  'Problem Framing': {
    positive: [
      /\b(problem statement|root cause|problem space|define the problem|user pain|pain point)\b/i,
      /\b(why|because|underlying|core issue|first principles)\b/i,
      /\b(5 whys|problem.solution fit|reframe)\b/i,
      /\b(hypothesis|assume|validate|insight)\b/i,
    ],
    negative: [
      /\b(i would build|let me build|my solution|i will create)\b/i,
      /\b(obviously|clearly the solution)\b/i,
    ],
    quotes: [/problem[^.]{5,80}/gi, /challenge[^.]{5,80}/gi],
  },
  'User Research': {
    positive: [
      /\b(user research|user interview|persona|user need|user pain|customer)\b/i,
      /\b(qualitative|quantitative|survey|feedback|empathy)\b/i,
      /\b(segment|cohort|user group|target user|power user)\b/i,
      /\b(validated|talked to|discovered|learned from)\b/i,
    ],
    negative: [
      /\b(assume users|users probably|users must want|i think users)\b/i,
    ],
    quotes: [/user[^.]{5,80}/gi, /customer[^.]{5,80}/gi],
  },
  'Metrics': {
    positive: [
      /\b(metric|kpi|measure|success criteria|north star|okr)\b/i,
      /\b(retention|conversion|activation|engagement|revenue|dau|mau|ltv|churn)\b/i,
      /\b(baseline|target|goal|increase by|reduce by|percentage)\b/i,
      /\b(guardrail|leading indicator|lagging indicator|counter.metric)\b/i,
    ],
    negative: [
      /\b(vague|unclear|some metrics|various metrics|different metrics)\b/i,
    ],
    quotes: [/metric[^.]{5,80}/gi, /measure[^.]{5,80}/gi, /kpi[^.]{5,80}/gi],
  },
  'Prioritization': {
    positive: [
      /\b(prioriti|trade.off|trade off|rank|phase|mvp|must.have|nice.to.have)\b/i,
      /\b(rice|ice|moscow|kano|impact|effort|feasib)\b/i,
      /\b(first|second|then|after that|in phase|short.term|long.term)\b/i,
      /\b(decision|chose|decided|rationale|because it)\b/i,
    ],
    negative: [
      /\b(build everything|all features|comprehensive solution|full feature set)\b/i,
    ],
    quotes: [/prioriti[^.]{5,80}/gi, /phase[^.]{5,80}/gi],
  },
  'Execution': {
    positive: [
      /\b(roadmap|milestone|timeline|launch|ship|release|sprint)\b/i,
      /\b(engineer|design|stakeholder|cross.functional|team|gtm|go.to.market)\b/i,
      /\b(risk|dependency|constraint|blocker|mitigation)\b/i,
      /\b(week|month|quarter|q[1-4]|phase \d)\b/i,
    ],
    negative: [
      /\b(eventually|someday|in the future|at some point)\b/i,
    ],
    quotes: [/launch[^.]{5,80}/gi, /roadmap[^.]{5,80}/gi],
  },
  'Communication': {
    positive: [],
    negative: [
      /\b(etc\.|and so on|and more|things like)\b/i,
    ],
    quotes: [],
  },
};

function extractQuote(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const re = new RegExp(pattern.source, pattern.flags);
    const match = re.exec(text);
    if (match) return match[0].trim().slice(0, 150);
  }
  const sentences = text.split(/[.!?]/);
  return sentences[0]?.trim().slice(0, 150) || '';
}

function scoreDimension(
  dimension: string,
  submissionText: string,
): DimensionScore {
  const signals = DIMENSION_SIGNALS[dimension];

  if (dimension === 'Communication') {
    const wordCount = submissionText.trim().split(/\s+/).length;
    const hasStructure = /\b(section|overview|background|approach|recommendation|conclusion|summary)\b/i.test(submissionText);
    const hasBullets = (submissionText.match(/^[-•*]\s/m) || []).length > 2;
    const hasHeaders = (submissionText.match(/^#+\s|^[A-Z][^a-z]{0,30}:\s/m) || []).length > 1;
    const vagueCount = (submissionText.match(/\betc\b|\band so on\b|\band more\b/gi) || []).length;

    let score = 5;
    if (wordCount > 400) score += 1;
    if (wordCount > 800) score += 1;
    if (hasStructure) score += 1;
    if (hasBullets || hasHeaders) score += 1;
    if (vagueCount > 3) score -= 2;
    if (wordCount < 200) score = Math.min(score, 4);

    return {
      dimension,
      score: Math.max(1, Math.min(10, score)),
      rationale: `Submission is ${wordCount} words. ${hasStructure ? 'Has clear sections.' : 'Lacks clear structure.'} ${hasBullets || hasHeaders ? 'Uses formatting.' : 'Minimal formatting.'} ${vagueCount > 0 ? `Contains ${vagueCount} vague filler phrases.` : ''}`,
      evidence_quotes: [submissionText.slice(0, 120).trim()],
    };
  }

  if (!signals) {
    return { dimension, score: 5, rationale: 'Unable to evaluate this dimension.', evidence_quotes: [] };
  }

  let positiveHits = 0;
  let negativeHits = 0;

  for (const pattern of signals.positive) {
    if (pattern.test(submissionText)) positiveHits++;
  }
  for (const pattern of signals.negative) {
    if (pattern.test(submissionText)) negativeHits++;
  }

  const maxPositive = signals.positive.length || 1;
  const baseScore = 3 + Math.round((positiveHits / maxPositive) * 6);
  const score = Math.max(1, Math.min(10, baseScore - negativeHits));

  const evidenceQuote = extractQuote(submissionText, signals.quotes);
  const rationale = `Found ${positiveHits}/${maxPositive} positive signals and ${negativeHits} negative signals for ${dimension}.`;

  return {
    dimension,
    score,
    rationale,
    evidence_quotes: evidenceQuote ? [evidenceQuote] : [],
  };
}

export function scorePmDimensions(input: {
  submission_text: string;
  jd_requirements: JdRequirements;
  dimensions: string[];
}): ScoresResult {
  const { submission_text, dimensions } = input;
  const scores = dimensions.map(dim => scoreDimension(dim, submission_text));
  return { scores };
}
