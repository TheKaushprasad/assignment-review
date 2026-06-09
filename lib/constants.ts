export const DIMENSIONS = [
  'Problem Framing',
  'User Research',
  'Metrics',
  'Prioritization',
  'Execution',
  'Communication',
];

export const DIMENSION_WEIGHTS: Record<string, number> = {
  'Problem Framing': 0.20,
  'User Research': 0.20,
  'Metrics': 0.20,
  'Prioritization': 0.15,
  'Execution': 0.15,
  'Communication': 0.10,
};

export const REWRITE_THRESHOLD = 6;

export const VERDICT_THRESHOLDS = {
  STRONG_HIRE: 8.0,
  HIRE: 6.5,
  BORDERLINE: 5.0,
};

export const KNOWN_FRAMEWORKS = [
  'RICE', 'ICE', 'MoSCoW', 'Kano', 'JTBD', 'Jobs to be Done',
  'OKR', 'OKRs', 'North Star', 'HEART', 'AARRR', 'Pirate Metrics',
  'PRD', 'Product Requirements Document', 'User Story', 'User Stories',
  'Design Thinking', 'Double Diamond', 'Lean Startup', 'Agile',
  'Sprint', 'Scrum', 'Kanban', 'Roadmap', 'GTM', 'Go-to-Market',
  'TAM SAM SOM', 'TAM', 'SAM', 'SOM', 'NPS', 'CSAT', 'DAU', 'MAU',
  'Opportunity Solution Tree', 'OST', 'Empathy Map', 'Journey Map',
  'Value Proposition Canvas', 'Business Model Canvas',
  'Hypothesis-driven', 'A/B test', 'A/B testing',
];

export const VAGUE_PHRASES = [
  'i would consider', 'maybe', 'potentially', 'perhaps', 'might want to',
  'could possibly', 'it depends', 'various factors', 'many things',
  'some users', 'certain users', 'multiple stakeholders',
  'different metrics', 'various metrics', 'we should look at',
  'we could explore', 'we might', 'something like', 'and more',
  'etc.', 'and so on', 'things like', 'a few options',
];

export const STEP_LABELS: Record<string, string> = {
  extract_jd_requirements: 'Extracting JD requirements',
  score_pm_dimensions: 'Scoring PM dimensions',
  detect_frameworks: 'Detecting frameworks',
  identify_strengths: 'Identifying strengths',
  flag_red_flags: 'Flagging red flags',
  generate_rewrites: 'Generating rewrites',
  self_critique: 'Running self-critique',
  compile_report: 'Compiling report',
};

export const MAX_AGENT_ITERATIONS = 20;
