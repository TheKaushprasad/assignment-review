import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ORCHESTRATOR_MODEL = 'gpt-4o';
export const REWRITE_MODEL = 'gpt-4o-mini';

export const TOOL_DEFINITIONS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'extract_jd_requirements',
      description:
        'Parse a Job Description to extract structured requirements: role level, company stage, key outcomes, must-have signals, domain, and triggers that the submission must address.',
      parameters: {
        type: 'object',
        properties: {
          jd_text: { type: 'string', description: 'The full text of the Job Description' },
        },
        required: ['jd_text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'score_pm_dimensions',
      description:
        'Score six PM evaluation dimensions (Problem Framing, User Research, Metrics, Prioritization, Execution, Communication) on a 1-10 scale. Each score must include rationale and evidence quotes from the submission.',
      parameters: {
        type: 'object',
        properties: {
          submission_text: {
            type: 'string',
            description: "The candidate's PM assignment submission",
          },
          jd_requirements: {
            type: 'object',
            description: 'Structured JD requirements from extract_jd_requirements',
          },
          dimensions: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of dimension names to score',
          },
        },
        required: ['submission_text', 'jd_requirements', 'dimensions'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'detect_frameworks',
      description:
        'Check which PM frameworks (RICE, JTBD, OKRs, Kano, North Star, etc.) appear in the submission. Note frameworks that are implied but not named.',
      parameters: {
        type: 'object',
        properties: {
          submission_text: {
            type: 'string',
            description: "The candidate's PM assignment submission",
          },
        },
        required: ['submission_text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'identify_strengths',
      description:
        "Surface what the candidate did well, with specific evidence quotes from the submission. Only cite things that are demonstrably present.",
      parameters: {
        type: 'object',
        properties: {
          submission_text: {
            type: 'string',
            description: "The candidate's PM assignment submission",
          },
          scores: { type: 'array', description: 'Dimension scores from score_pm_dimensions' },
          jd_requirements: { type: 'object', description: 'Structured JD requirements' },
        },
        required: ['submission_text', 'scores', 'jd_requirements'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'flag_red_flags',
      description:
        'Identify weaknesses, gaps, and warning signs in the submission. Detect vague reasoning, missing metrics, absent user data, generic solutions, and missing trade-off discussions.',
      parameters: {
        type: 'object',
        properties: {
          submission_text: {
            type: 'string',
            description: "The candidate's PM assignment submission",
          },
          scores: { type: 'array', description: 'Dimension scores from score_pm_dimensions' },
          jd_requirements: { type: 'object', description: 'Structured JD requirements' },
        },
        required: ['submission_text', 'scores', 'jd_requirements'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_rewrites',
      description:
        'Generate improved before/after rewrites for sections that scored below the threshold. Only call this if at least one dimension scored below 6.',
      parameters: {
        type: 'object',
        properties: {
          submission_text: {
            type: 'string',
            description: "The candidate's PM assignment submission",
          },
          scores: { type: 'array', description: 'Dimension scores from score_pm_dimensions' },
          rewrite_threshold: {
            type: 'number',
            description: 'Score threshold below which rewrites are generated (default: 6)',
          },
        },
        required: ['submission_text', 'scores', 'rewrite_threshold'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'self_critique',
      description:
        'Audit the scoring for consistency and bias. Check if scores are consistent with red flags and strengths. Detect leniency bias (all 7s), severity bias, or missed signals.',
      parameters: {
        type: 'object',
        properties: {
          scores: { type: 'array', description: 'Dimension scores from score_pm_dimensions' },
          red_flags: { type: 'array', description: 'Red flags from flag_red_flags' },
          strengths: { type: 'array', description: 'Strengths from identify_strengths' },
          submission_text: {
            type: 'string',
            description: "The candidate's PM assignment submission",
          },
        },
        required: ['scores', 'red_flags', 'strengths', 'submission_text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compile_report',
      description:
        'Assemble all evaluation outputs into the final validated JSON report. Compute weighted overall score and derive the hiring verdict.',
      parameters: {
        type: 'object',
        properties: {
          jd_requirements: { type: 'object', description: 'Output from extract_jd_requirements' },
          scores: { type: 'array', description: 'Output from score_pm_dimensions' },
          frameworks: { type: 'object', description: 'Output from detect_frameworks' },
          strengths: { type: 'array', description: 'Output from identify_strengths' },
          red_flags: { type: 'array', description: 'Output from flag_red_flags' },
          rewrites: {
            type: 'array',
            description: 'Output from generate_rewrites (may be empty if skipped)',
          },
          self_critique: { type: 'object', description: 'Output from self_critique' },
        },
        required: [
          'jd_requirements',
          'scores',
          'frameworks',
          'strengths',
          'red_flags',
          'rewrites',
          'self_critique',
        ],
      },
    },
  },
];
