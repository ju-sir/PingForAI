import { describe, expect, it, vi } from 'vitest';
import type { NativeImage } from 'electron';
import { AiAssist, buildVisionRequest, focusCropRect } from '../../src/main/aiAssist';

describe('ai assistance', () => {
  it('uses a configured chat endpoint and extracts the vision answer', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: '  这是一个错误提示  ' } }] }), { status: 200 }));
    const ai = new AiAssist({ apiKey: 'test-key', model: 'deepseek-flash', endpoint: 'https://api.deepseek.com/chat/completions', fetch: request });
    const image = { toPNG: () => Buffer.from('test-image') } as NativeImage;
    expect(await ai.explain(image, '解释附近的内容')).toBe('这是一个错误提示');
    expect(request.mock.calls[0][0]).toBe('https://api.deepseek.com/chat/completions');
    const options = request.mock.calls[0][1]!;
    expect(JSON.parse(options.body as string).messages[0].content[1].image_url.url).toBe('data:image/png;base64,dGVzdC1pbWFnZQ==');
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(await ai.explain(image, '再次解释')).toBeNull();
    expect(request).toHaveBeenCalledOnce();
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
