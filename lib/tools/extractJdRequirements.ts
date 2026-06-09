import { JdRequirements } from '../types';

const ROLE_LEVEL_PATTERNS: [RegExp, string][] = [
  [/\b(staff|principal|director|vp|head of product)\b/i, 'Senior IC / Leadership'],
  [/\bsenior\b/i, 'Senior'],
  [/\b(associate|apgm|apm)\b/i, 'Associate / APM'],
  [/\bjunior\b/i, 'Junior'],
  [/\b(lead|group)\b/i, 'Lead'],
];

const COMPANY_STAGE_PATTERNS: [RegExp, string][] = [
  [/\b(series [cde]|ipo|public company|enterprise)\b/i, 'Late-stage / Enterprise'],
  [/\b(series [ab]|growth stage|scale-up|scaleup)\b/i, 'Growth'],
  [/\b(seed|series a|early.stage|startup|pre-product)\b/i, 'Early-stage'],
];

const DOMAIN_PATTERNS: [RegExp, string][] = [
  [/\b(fintech|financial|payments|banking|lending)\b/i, 'Fintech'],
  [/\b(healthtech|health|medical|clinical|healthcare)\b/i, 'Healthtech'],
  [/\b(edtech|education|learning|e-learning)\b/i, 'Edtech'],
  [/\b(saas|b2b|enterprise software|platform)\b/i, 'B2B SaaS'],
  [/\b(consumer|b2c|marketplace|social)\b/i, 'B2C / Consumer'],
  [/\b(mobile|ios|android|app)\b/i, 'Mobile'],
  [/\b(data|analytics|ml|ai|machine learning)\b/i, 'Data / AI'],
  [/\b(e-commerce|ecommerce|retail|shopping)\b/i, 'E-commerce'],
];

const KEY_OUTCOME_PATTERNS = [
  /(?:drive|grow|improve|increase|reduce|scale|launch|build|own|lead|define)\s+([^.]{10,80})/gi,
];

const MUST_HAVE_SIGNAL_PATTERNS = [
  /\b(data.driven|metrics|analytical|structured|cross.functional|collaboration|stakeholder|roadmap)\b/gi,
];

const RED_FLAG_TRIGGER_PATTERNS = [
  /(?:must|required|essential|critical|key)\s+(?:have|be|demonstrate|show)?\s*([^.]{5,60})/gi,
];

function extractMatches(text: string, pattern: RegExp): string[] {
  const results: string[] = [];
  let match;
  const re = new RegExp(pattern.source, pattern.flags);
  while ((match = re.exec(text)) !== null) {
    if (match[1]) results.push(match[1].trim());
    if (results.length >= 5) break;
  }
  return results;
}

export function extractJdRequirements(input: { jd_text: string }): JdRequirements {
  const { jd_text } = input;
  const text = jd_text || '';

  let role_level = 'Mid-level';
  for (const [pattern, level] of ROLE_LEVEL_PATTERNS) {
    if (pattern.test(text)) { role_level = level; break; }
  }

  let company_stage = 'Unknown';
  for (const [pattern, stage] of COMPANY_STAGE_PATTERNS) {
    if (pattern.test(text)) { company_stage = stage; break; }
  }

  let domain = 'General Tech';
  for (const [pattern, d] of DOMAIN_PATTERNS) {
    if (pattern.test(text)) { domain = d; break; }
  }

  const key_outcomes = extractMatches(text, KEY_OUTCOME_PATTERNS[0]).slice(0, 5);
  if (key_outcomes.length === 0) key_outcomes.push('Define and execute product strategy');

  const must_have_signals_raw = text.match(MUST_HAVE_SIGNAL_PATTERNS[0]) || [];
  const must_have_signals = Array.from(new Set(must_have_signals_raw.map(s => s.toLowerCase()))).slice(0, 8);

  const red_flag_triggers = extractMatches(text, RED_FLAG_TRIGGER_PATTERNS[0]).slice(0, 5);

  return { role_level, company_stage, key_outcomes, must_have_signals, domain, red_flag_triggers };
}
