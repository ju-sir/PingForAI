// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { startPage } from '../../site/page';

beforeEach(() => { document.documentElement.innerHTML = readFileSync('site/index.html', 'utf8'); });
describe('showcase walkthrough', () => {
  it('starts local-only and reveals a useful fixture without making a network request', () => {
    const request = vi.spyOn(globalThis, 'fetch');
    startPage();
    expect(document.querySelector('#demo-answer')!.textContent).toContain('点击左侧问号');
    (document.querySelector('#ping') as HTMLButtonElement).click();
    expect(document.querySelector('#demo-answer')!.textContent).toContain('cart.items ?? []');
    expect(request).not.toHaveBeenCalled();
    request.mockRestore();
  });
  it('switches all four tasks and updates scope without losing the answer', () => {
    startPage();
    (document.querySelector('#ping') as HTMLButtonElement).click();
    for (const task of ['translate', 'formula', 'explain', 'debug']) {
      const button = document.querySelector<HTMLButtonElement>(`[data-task="${task}"]`)!;
      button.click();
      expect(button.getAttribute('aria-pressed')).toBe('true');
      expect(document.querySelectorAll('[data-task][aria-pressed="true"]')).toHaveLength(1);
      expect(document.querySelector('#demo-answer h3')!.textContent).toContain('示例');
    }
    const toggle = document.querySelector<HTMLInputElement>('#overview')!;
    toggle.click();
    expect(document.querySelector('#scope-label')!.textContent).toContain('80%');
    expect(document.querySelector('#sample-area')!.classList.contains('with-overview')).toBe(true);
    toggle.click();
    expect(document.querySelector('#scope-label')!.textContent).toContain('仅上传局部');
  });
  it('can switch tasks before pinging and tolerates non-demo pages', () => {
    startPage();
    document.querySelector<HTMLButtonElement>('[data-task="formula"]')!.click();
    expect(document.querySelector('#sample-title')!.textContent).toContain('mean');
    expect(document.querySelector('#demo-answer')!.textContent).toContain('点击左侧问号');
    document.body.replaceChildren();
    expect(() => startPage()).not.toThrow();
  });
});
