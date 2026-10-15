import type { Lang } from './i18n';

export const AI_TASKS = [
  { id: 'explain', zh: '解释内容', en: 'Explain', prompt: ['解释信号附近的内容：先直接回答用户可能的疑问，再说明关键术语和下一步。不要泛泛描述整张截图。', 'Explain the content near the ping. Answer the likely question first, then clarify terms and suggest a next step.'] },
  { id: 'translate', zh: '翻译文本', en: 'Translate', prompt: ['翻译信号附近的文字为中文，保留原意、数字、代码和专有名词；必要时解释语境，不要翻译无关区域。', 'Translate the text near the ping into English. Preserve meaning, numbers, code and proper names; explain context only when needed.'] },
  { id: 'debug', zh: '排查错误', en: 'Debug', prompt: ['排查信号附近的错误：引用可见报错，区分已知事实和推测，按优先级给出可验证的修复步骤；不要编造环境。', 'Diagnose the error near the ping. Quote visible errors, separate facts from hypotheses, and give ordered, verifiable fixes.'] },
  { id: 'formula', zh: '讲解公式', en: 'Explain formula', prompt: ['讲解信号附近的公式：先说明它在求什么，再解释符号、前提和推导步骤；识别不清的符号先提出确认。', 'Explain the formula near the ping: its purpose, symbols, assumptions and derivation. Ask for clarification of unreadable symbols.'] },
] as const;
export type AiTask = typeof AI_TASKS[number]['id'];
export const taskPrompt = (id: AiTask, lang: Lang): string => AI_TASKS.find((t) => t.id === id)!.prompt[lang === 'zh-CN' ? 0 : 1];
export interface AiCaptureOptions { size: 'small' | 'medium' | 'large'; includeOverview: boolean }
export const CAPTURE_SIZES = { small: { width: 384, height: 288 }, medium: { width: 640, height: 480 }, large: { width: 960, height: 720 } } as const;
export function normalizeAiCapture(raw: unknown): AiCaptureOptions {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<AiCaptureOptions>;
  return { size: r.size === 'small' || r.size === 'large' ? r.size : 'medium', includeOverview: r.includeOverview === true };
}
