import { describe, expect, it, vi } from 'vitest';
import type { NativeImage } from 'electron';
import { prepareAiCapture, buildVisionRequest, AiAssist } from '../../src/main/aiAssist';

function image() {
  const local = { toPNG: () => Buffer.from('local') };
  return { getSize: () => ({ width: 1920, height: 1080 }), crop: vi.fn(() => local),
    resize: vi.fn(() => ({ toDataURL: () => 'overview' })), toDataURL: vi.fn(() => 'whole') };
}
describe('capture scope', () => {
  it('never generates or sends an overview in local-only mode, but keeps exact coordinates', () => {
    const source = image();
    const result = prepareAiCapture(source as unknown as NativeImage, { x: 1900, y: 1060 }, { size: 'small', includeOverview: false });
    expect(source.crop).toHaveBeenCalledWith({ x: 1536, y: 792, width: 384, height: 288 });
    expect(source.resize).not.toHaveBeenCalled();
    expect(source.toDataURL).not.toHaveBeenCalled();
    expect(result.context).toEqual({ marker: { x: 364, y: 268 } });
    const content = buildVisionRequest('local', 'vision', 'task', result.context).messages[0].content;
    expect(content.filter((p) => p.type === 'image_url')).toHaveLength(1);
    expect(content[0].text).toContain('(364, 268)');
    expect(content[0].text).not.toContain('第二张');
  });
  it('only adds an overview with explicit consent and respects large focus size', () => {
    const source = image();
    const result = prepareAiCapture(source as unknown as NativeImage, { x: 1000, y: 600 }, { size: 'large', includeOverview: true });
    expect(source.crop).toHaveBeenCalledWith({ x: 520, y: 240, width: 960, height: 720 });
    expect(source.resize).toHaveBeenCalledWith({ width: 1280 });
    expect(result.context.imageUrl).toBe('overview');
  });
  it('clamps a medium crop on small screens and does not upscale its overview', () => {
    const source = image();
    source.getSize = () => ({ width: 320, height: 200 });
    const result = prepareAiCapture(source as unknown as NativeImage, { x: 10, y: 20 }, { size: 'medium', includeOverview: true });
    expect(source.crop).toHaveBeenCalledWith({ x: 0, y: 0, width: 320, height: 200 });
    expect(source.resize).not.toHaveBeenCalled();
    expect(result.context.imageUrl).toBe('whole');
  });
});
describe('request lifecycle', () => {
  it('blocks concurrent uploads even when cooldown is zero and unlocks after failure', async () => {
    let reject!: (reason: Error) => void;
    const request = vi.fn<typeof fetch>().mockImplementationOnce(() => new Promise((_, r) => { reject = r; }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ output_text: 'recovered' })));
    const ai = new AiAssist({ apiKey: 'test', fetch: request, cooldownMs: 0 });
    const source = { toPNG: () => Buffer.from('test') } as NativeImage;
    const pending = ai.explain(source, 'task');
    expect(ai.busy).toBe(true);
    expect(await ai.explain(source, 'duplicate')).toBeNull();
    expect(request).toHaveBeenCalledTimes(1);
    reject(new Error('network'));
    await expect(pending).rejects.toThrow();
    expect(ai.busy).toBe(false);
    expect(await ai.explain(source, 'retry')).toBe('recovered');
  });
});
