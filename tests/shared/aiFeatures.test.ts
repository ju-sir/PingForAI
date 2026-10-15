import { describe, expect, it } from 'vitest';
import { AI_TASKS, taskPrompt } from '../../src/shared/aiFeatures';
import { normalizeSettings, mergeSettings } from '../../src/shared/settings';

describe('AI task lenses and privacy', () => {
  it('offers specific, localized tasks without changing signal actions', () => {
    expect(AI_TASKS.map((t) => t.id)).toEqual(['explain', 'translate', 'debug', 'formula']);
    for (const task of AI_TASKS) {
      expect(taskPrompt(task.id, 'zh-CN').length).toBeGreaterThan(30);
      expect(taskPrompt(task.id, 'en').length).toBeGreaterThan(30);
    }
    expect(taskPrompt('translate', 'zh-CN')).toContain('翻译');
    expect(taskPrompt('debug', 'en')).toContain('error');
    expect(taskPrompt('formula', 'zh-CN')).toContain('公式');
  });
  it('defaults existing and new installs to local-only screenshots', () => {
    expect(normalizeSettings({}).aiCapture).toEqual({ size: 'medium', includeOverview: false });
    expect(normalizeSettings({ aiCapture: { size: 'huge', includeOverview: 'yes' } }).aiCapture)
      .toEqual({ size: 'medium', includeOverview: false });
  });
  it('persists explicit capture choices and preserves prompts on unrelated changes', () => {
    const before = normalizeSettings({ aiSignals: { missing: { action: 'copy', prompt: 'my task' } } });
    const after = mergeSettings(before, { aiCapture: { size: 'small', includeOverview: true } });
    expect(after.aiCapture).toEqual({ size: 'small', includeOverview: true });
    expect(after.aiSignals.missing).toEqual(before.aiSignals.missing);
  });
});
