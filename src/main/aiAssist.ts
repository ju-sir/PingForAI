import type { NativeImage } from 'electron';

export interface Size { width: number; height: number }
export interface Point { x: number; y: number }
export interface CropRect { x: number; y: number; width: number; height: number }

/** Returns a crop centered on the marker and clamped to the captured display. */
export function focusCropRect(display: Size, marker: Point, width: number, height: number): CropRect {
  const w = Math.min(display.width, Math.max(1, Math.round(width)));
  const h = Math.min(display.height, Math.max(1, Math.round(height)));
  return {
    x: Math.min(Math.max(Math.round(marker.x - w / 2), 0), display.width - w),
    y: Math.min(Math.max(Math.round(marker.y - h / 2), 0), display.height - h),
    width: w,
    height: h,
  };
}

export function buildVisionRequest(imageUrl: string, model: string, prompt: string): {
  model: string;
  messages: [{ role: 'user'; content: [{ type: 'text'; text: string }, { type: 'image_url'; image_url: { url: string } }] }];
} {
  return {
    model,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageUrl } },
      ],
    }],
  };
}

function outputText(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const text = (body as { output_text?: unknown }).output_text;
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

export interface AiAssistOptions {
  getConfig?: () => { apiKey: string; model: string; endpoint: string };
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  endpoint?: string;
  fetch?: typeof globalThis.fetch;
  now?: () => number;
  cooldownMs?: number;
}

/** Calls the vision model without exposing credentials to a renderer. */
export class AiAssist {
  private lastStarted = -Infinity;
  private readonly fetch: typeof globalThis.fetch;
  private readonly now: () => number;
  private readonly cooldownMs: number;

  constructor(private readonly opts: AiAssistOptions = {}) {
    this.fetch = opts.fetch ?? fetch;
    this.now = opts.now ?? Date.now;
    this.cooldownMs = opts.cooldownMs ?? 8_000;
  }

  get configured(): boolean { return Boolean(this.opts.getConfig?.().apiKey ?? this.opts.apiKey ?? process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY); }

  async explain(image: NativeImage, prompt: string): Promise<string | null> {
    const opts = { ...this.opts, ...this.opts.getConfig?.() };
    const apiKey = opts.apiKey ?? process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;
    if (!apiKey || this.now() - this.lastStarted < this.cooldownMs) return null;
    this.lastStarted = this.now();
    const imageUrl = `data:image/png;base64,${image.toPNG().toString('base64')}`;
    const baseUrl = (this.opts.baseUrl ?? process.env.AI_BASE_URL ?? 'https://api.openai.com').replace(/\/$/, '');
    const endpoint = opts.endpoint ?? process.env.AI_CHAT_ENDPOINT ?? `${baseUrl}/v1/chat/completions`;
    const response = await this.fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(buildVisionRequest(imageUrl, opts.model ?? process.env.AI_MODEL ?? 'gpt-4.1-mini', prompt)),
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) throw new Error(`AI request failed (${response.status})`);
    const body = await response.json() as { output_text?: unknown; choices?: Array<{ message?: { content?: unknown } }> };
    if (typeof body.choices?.[0]?.message?.content === 'string') return body.choices[0].message.content.trim() || null;
    return outputText(body);
  }
}
