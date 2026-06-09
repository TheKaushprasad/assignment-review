import { AnalysisReport, CompileReportInput, Verdict } from '../types';
import { DIMENSION_WEIGHTS, VERDICT_THRESHOLDS } from '../constants';

function deriveVerdict(overallScore: number): Verdict {
  if (overallScore >= VERDICT_THRESHOLDS.STRONG_HIRE) return 'Strong Hire';
  if (overallScore >= VERDICT_THRESHOLDS.HIRE) return 'Hire';
  if (overallScore >= VERDICT_THRESHOLDS.BORDERLINE) return 'Borderline';
  return 'No Hire';
}

function computeWeightedScore(scores: { dimension: string; score: number }[]): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const s of scores) {
    const weight = DIMENSION_WEIGHTS[s.dimension] ?? (1 / scores.length);
    weightedSum += s.score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;
}

function generateSummary(
  verdict: Verdict,
  overallScore: number,
  topStrength: string | undefined,
  topRedFlag: string | undefined,
): string {
  const verdictText: Record<Verdict, string> = {
    'Strong Hire': 'This is a strong submission that demonstrates senior PM thinking across multiple dimensions.',
    'Hire': 'This submission shows solid PM capability with clear strengths that outweigh the gaps.',
    'Borderline': 'This submission shows some PM potential but has notable gaps that would need to be addressed.',
    'No Hire': 'This submission does not demonstrate the PM fundamentals required for this role.',
  };

  let summary = `${verdictText[verdict]} Overall score: ${overallScore}/10.`;
  if (topStrength) summary += ` Key strength: ${topStrength}.`;
  if (topRedFlag) summary += ` Key concern: ${topRedFlag}.`;
  return summary;
}

export function compileReport(input: CompileReportInput): AnalysisReport {
  const { scores, frameworks, strengths, red_flags, rewrites, self_critique } = input;

  // Use adjusted scores from self-critique if available
  const finalScores = self_critique.adjusted_scores ?? scores;

  const overall_score = computeWeightedScore(finalScores);
  const verdict = deriveVerdict(overall_score);

  const topStrength = strengths[0]?.title;
  const topRedFlag = red_flags.find(f => f.severity === 'high')?.category
    ?? red_flags[0]?.category;

  const summary = generateSummary(verdict, overall_score, topStrength, topRedFlag);

  return {
    verdict,
    overall_score,
    summary,
    dimensions: finalScores,
    frameworks,
    strengths,
    red_flags,
    rewrites,
    self_critique,
    metadata: {
      evaluated_at: new Date().toISOString(),
      model: 'claude-sonnet-4-6',
    },
  };
}
