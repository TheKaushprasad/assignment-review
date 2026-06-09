import { extractJdRequirements } from './tools/extractJdRequirements';
import { scorePmDimensions } from './tools/scorePmDimensions';
import { detectFrameworks } from './tools/detectFrameworks';
import { identifyStrengths } from './tools/identifyStrengths';
import { flagRedFlags } from './tools/flagRedFlags';
import { generateRewrites } from './tools/generateRewrites';
import { selfCritique } from './tools/selfCritique';
import { compileReport } from './tools/compileReport';
import { DIMENSIONS } from './constants';

type ToolInput = Record<string, unknown>;

export async function executeTool(name: string, input: ToolInput): Promise<unknown> {
  switch (name) {
    case 'extract_jd_requirements':
      return extractJdRequirements(input as { jd_text: string });

    case 'score_pm_dimensions':
      return scorePmDimensions({
        submission_text: input.submission_text as string,
        jd_requirements: input.jd_requirements as Parameters<typeof scorePmDimensions>[0]['jd_requirements'],
        dimensions: (input.dimensions as string[]) ?? DIMENSIONS,
      });

    case 'detect_frameworks':
      return detectFrameworks(input as { submission_text: string });

    case 'identify_strengths':
      return identifyStrengths(input as Parameters<typeof identifyStrengths>[0]);

    case 'flag_red_flags':
      return flagRedFlags(input as Parameters<typeof flagRedFlags>[0]);

    case 'generate_rewrites':
      return generateRewrites(input as Parameters<typeof generateRewrites>[0]);

    case 'self_critique':
      return selfCritique(input as Parameters<typeof selfCritique>[0]);

    case 'compile_report':
      return compileReport(input as unknown as Parameters<typeof compileReport>[0]);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
