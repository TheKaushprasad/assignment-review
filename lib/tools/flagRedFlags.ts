import { DimensionScore, JdRequirements, RedFlag, RedFlagsResult } from '../types';
import { VAGUE_PHRASES } from '../constants';

function findVagueQuote(text: string, phrases: string[]): string {
  for (const phrase of phrases) {
    const idx = text.toLowerCase().indexOf(phrase);
    if (idx !== -1) {
      return text.slice(Math.max(0, idx - 10), idx + 80).trim();
    }
  }
  return '';
}

export function flagRedFlags(input: {
  submission_text: string;
  scores: DimensionScore[];
  jd_requirements: JdRequirements;
}): RedFlagsResult {
  const { submission_text, scores, jd_requirements } = input;
  const text = submission_text || '';
  const red_flags: RedFlag[] = [];

  // Vague language
  const foundVague = VAGUE_PHRASES.filter(p => text.toLowerCase().includes(p));
  if (foundVague.length >= 3) {
    red_flags.push({
      category: 'Vague Language',
      description: `Submission uses ${foundVague.length} hedging phrases that signal lack of conviction or specificity.`,
      quote: findVagueQuote(text, foundVague),
      severity: foundVague.length >= 6 ? 'high' : 'medium',
    });
  }

  // Missing metrics
  const hasMetrics = /\b(metric|kpi|percentage|retention|conversion|dau|mau|ltv|churn|revenue|nps)\b/i.test(text);
  if (!hasMetrics) {
    red_flags.push({
      category: 'No Measurable Outcomes',
      description: 'No specific metrics, KPIs, or measurable success criteria defined. Success would be impossible to evaluate.',
      quote: '',
      severity: 'high',
    });
  }

  // Missing user research
  const hasUserResearch = /\b(user research|user interview|user feedback|persona|jtbd|customer discovery)\b/i.test(text);
  if (!hasUserResearch) {
    red_flags.push({
      category: 'Missing User Research',
      description: 'No mention of user research, interviews, or customer discovery. Recommendations appear assumption-driven.',
      quote: '',
      severity: 'medium',
    });
  }

  // Missing trade-off reasoning
  const hasTradeoffs = /\b(trade.off|trade off|because|rather than|instead of|chose|decided|prioriti)\b/i.test(text);
  if (!hasTradeoffs) {
    red_flags.push({
      category: 'No Trade-off Reasoning',
      description: 'No explicit prioritization logic or trade-off reasoning. Decisions appear made without criteria.',
      quote: '',
      severity: 'medium',
    });
  }

  // Generic/non-specific solution
  const domainKeywords = jd_requirements.domain.toLowerCase().split(/[\s/]/);
  const mentionsDomain = domainKeywords.some(kw => kw.length > 3 && text.toLowerCase().includes(kw));
  if (!mentionsDomain && jd_requirements.domain !== 'General Tech') {
    red_flags.push({
      category: 'Generic Solution',
      description: `Solution does not appear tailored to the ${jd_requirements.domain} domain specified in the JD. Could apply to any PM role.`,
      quote: '',
      severity: 'medium',
    });
  }

  // Very short submission
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 200) {
    red_flags.push({
      category: 'Insufficient Depth',
      description: `Submission is only ~${wordCount} words. A PM assignment typically requires 400–1000 words to demonstrate sufficient depth.`,
      quote: text.slice(0, 100),
      severity: 'high',
    });
  }

  // Low-scoring dimensions
  const criticalLowScores = scores.filter(s => s.score <= 3);
  for (const s of criticalLowScores) {
    red_flags.push({
      category: `Weak ${s.dimension}`,
      description: `Scored ${s.score}/10 on ${s.dimension}. ${s.rationale}`,
      quote: s.evidence_quotes[0] || '',
      severity: s.score <= 2 ? 'high' : 'medium',
    });
  }

  return { red_flags };
}
