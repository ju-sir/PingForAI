import { describe, expect, it } from 'vitest';
import { buildVisionRequest, focusCropRect, isAiAssistPing } from '../../src/main/aiAssist';

describe('ai assistance', () => {
  it('only treats the enemy-missing question-mark ping as an AI trigger', () => {
    expect(isAiAssistPing('missing')).toBe(true);
    expect(isAiAssistPing('danger')).toBe(false);
  });

  it('keeps the screenshot crop inside the display', () => {
    expect(focusCropRect({ width: 1920, height: 1080 }, { x: 20, y: 30 }, 640, 480)).toEqual({
      x: 0, y: 0, width: 640, height: 480,
    });
    expect(focusCropRect({ width: 1920, height: 1080 }, { x: 1900, y: 1060 }, 640, 480)).toEqual({
      x: 1280, y: 600, width: 640, height: 480,
    });
  });

  it('builds a vision request that tells the model to focus near the marker', () => {
    const request = buildVisionRequest('data:image/png;base64,abc', 'gpt-4.1-mini', '请解释这个界面');
    expect(request.model).toBe('gpt-4.1-mini');
    expect(request.messages[0].content[1].type).toBe('image_url');
    expect(request.messages[0].content[1].image_url.url).toBe('data:image/png;base64,abc');
    expect(request.messages[0].content[0].text).toBe('请解释这个界面');
  });
});
