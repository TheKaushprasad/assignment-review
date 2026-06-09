import { Bias, DimensionScore, RedFlag, SelfCritiqueResult, Strength } from '../types';

export function selfCritique(input: {
  scores: DimensionScore[];
  red_flags: RedFlag[];
  strengths: Strength[];
  submission_text: string;
}): SelfCritiqueResult {
  const { scores, red_flags, strengths } = input;

  const issues: string[] = [];
  const missed_signals: string[] = [];
  let bias_detected: Bias = 'none';
  let adjusted_scores: DimensionScore[] | null = null;

  // Check for leniency bias: many high scores but also many red flags
  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const highRedFlags = red_flags.filter(f => f.severity === 'high').length;

  if (avgScore >= 7.5 && highRedFlags >= 2) {
    bias_detected = 'lenient';
    issues.push('Scoring may be too lenient: average score is high despite multiple high-severity red flags.');
    // Nudge scores down slightly for dimensions with corresponding red flags
    const adjustedMap = new Map(scores.map(s => [s.dimension, s]));
    for (const flag of red_flags.filter(f => f.severity === 'high')) {
      const dimName = scores.find(s => flag.category.toLowerCase().includes(s.dimension.toLowerCase()));
      if (dimName && adjustedMap.has(dimName.dimension)) {
        const current = adjustedMap.get(dimName.dimension)!;
        adjustedMap.set(dimName.dimension, { ...current, score: Math.max(1, current.score - 1) });
      }
    }
    adjusted_scores = Array.from(adjustedMap.values());
  }

  // Check for severity bias: all low scores despite no red flags
  const lowScores = scores.filter(s => s.score <= 4).length;
  if (avgScore <= 4.5 && red_flags.length === 0) {
    bias_detected = 'harsh';
    issues.push('Scoring may be too harsh: all dimensions scored low but no specific red flags were identified.');
  }

  // Check for clustering: all scores in a narrow band
  const maxScore = Math.max(...scores.map(s => s.score));
  const minScore = Math.min(...scores.map(s => s.score));
  if (maxScore - minScore <= 1 && scores.length >= 4) {
    issues.push('Score clustering detected — all dimensions within 1 point of each other. Review whether each dimension was evaluated independently.');
  }

  // Check for inconsistency: dimension has no red flag but low score, or high score but a red flag
  for (const score of scores) {
    if (score.score >= 8 && red_flags.some(f => f.category.toLowerCase().includes(score.dimension.toLowerCase()))) {
      issues.push(`${score.dimension} scored ${score.score}/10 but has an associated red flag — consider revising.`);
    }
    if (score.score <= 3 && !red_flags.some(f => f.category.toLowerCase().includes(score.dimension.toLowerCase()))) {
      missed_signals.push(`${score.dimension} scored very low (${score.score}/10) but no corresponding red flag was flagged.`);
    }
  }

  // Check coverage: are there strengths with no supporting high score?
  for (const strength of strengths) {
    const matching = scores.find(s => strength.title.toLowerCase().includes(s.dimension.toLowerCase().split(' ')[0]));
    if (matching && matching.score < 6) {
      issues.push(`Strength titled "${strength.title}" claims positive evidence but the corresponding dimension score is only ${matching.score}/10.`);
    }
  }

  // Check for missing signals
  if (lowScores >= 3 && strengths.length === 0) {
    missed_signals.push('Very low scores across multiple dimensions — verify if any positive signals were overlooked.');
  }

  const critique = issues.length > 0
    ? issues.join(' ')
    : 'Scoring appears internally consistent. Red flags and strengths are well-correlated with dimension scores.';

  return { critique, adjusted_scores, bias_detected, missed_signals };
}
