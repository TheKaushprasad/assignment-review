import { FrameworksResult } from '../types';
import { KNOWN_FRAMEWORKS } from '../constants';

export function detectFrameworks(input: { submission_text: string }): FrameworksResult {
  const { submission_text } = input;
  const text = submission_text || '';

  const frameworks_used: string[] = [];
  const frameworks_missing: string[] = [];

  for (const framework of KNOWN_FRAMEWORKS) {
    const pattern = new RegExp(`\\b${framework.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(text)) {
      if (!frameworks_used.includes(framework)) {
        frameworks_used.push(framework);
      }
    }
  }

  const coreFrameworks = ['RICE', 'JTBD', 'OKR', 'Kano', 'North Star', 'PRD'];
  for (const f of coreFrameworks) {
    if (!frameworks_used.some(u => u.toLowerCase().includes(f.toLowerCase()))) {
      frameworks_missing.push(f);
    }
  }

  const impliedNotes: string[] = [];
  if (!/\brice\b|\bice\b|\bmoscow\b|\bkano\b/i.test(text) && /\bprioritiz/i.test(text)) {
    impliedNotes.push('Prioritization approach implied but no named framework used');
  }
  if (!/\bjtbd\b|\bjobs to be done\b/i.test(text) && /\buser need|user want/i.test(text)) {
    impliedNotes.push('User needs discussed but JTBD framework not explicitly named');
  }
  if (!/\bokr\b/i.test(text) && /\bgoal|objective|key result/i.test(text)) {
    impliedNotes.push('Goal-setting present but OKR framework not mentioned');
  }

  const notes = impliedNotes.length > 0
    ? impliedNotes.join('. ')
    : frameworks_used.length > 0
      ? `${frameworks_used.length} framework(s) explicitly named.`
      : 'No PM frameworks explicitly named in the submission.';

  return { frameworks_used, frameworks_missing, notes };
}
