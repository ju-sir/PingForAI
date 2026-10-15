import { AI_TASKS, type AiTask } from '../src/shared/aiFeatures';

const SAMPLES: Record<AiTask, { title: string; source: string; answer: string }> = {
  debug: { title: 'checkout.ts', source: '08  async function checkout(cart) {\n09    const items = cart.items;\n10    return items.map(toOrder);\n11  }\n\nTypeError: Cannot read properties\nof undefined (reading “map”)', answer: '错误出在 items.map()\n\nitems 当前是 undefined，不能调用数组的 map 方法。\n\n① 检查 cart.items 是否已经加载。\n② 如果空购物车是合法状态，可用 cart.items ?? [] 提供默认值。\n③ 如果字段本应存在，排查接口返回结构，不要只用默认值掩盖问题。' },
  translate: { title: 'reading-notes.md', source: 'READING NOTES\n\n“Clarity is not a gift of the writer.\nIt is a responsibility.”\n\nGood ideas deserve\nto be understood.', answer: '“清晰表达不是作者额外给予的礼物，而是作者的责任。”\n\n这里将 gift 与 responsibility 对比，强调让读者看懂是写作者应承担的工作。\n\n最后一句：好的想法值得被理解。' },
  formula: { title: 'statistics / mean', source: 'STATISTICS / 01\n\n             n\n     x̄ = 1/n ∑ xᵢ\n            i=1\n\n     Example: 2, 4, 6', answer: '这是算术平均数公式\n\nx̄ 表示平均数，n 是数据个数，xᵢ 是第 i 个值。Σ 表示把这些值相加。\n\n对于 2、4、6：\n(2 + 4 + 6) / 3 = 4\n\n每个样本在这个公式中的权重相同。' },
  explain: { title: 'preferences / sync', source: 'PREFERENCES\n\n  Sync over metered connections\n  ○ Off\n\n  Changes apply to this device.\n  Last synced: just now', answer: '这是“在按流量计费的网络下同步”选项\n\n开启后，应用可以在手机热点等可能产生流量费用的网络下同步。关闭可减少这些网络上的数据消耗。\n\n附近文字说明：此设置只影响当前设备。是否开启取决于你的流量套餐与同步需求。' },
};

/** Browser-only fixtures: no screenshot access, model calls or credentials. */
export function startPage(): void {
  const source = document.querySelector<HTMLElement>('#sample-content');
  const title = document.querySelector<HTMLElement>('#sample-title');
  const answer = document.querySelector<HTMLElement>('#demo-answer');
  const area = document.querySelector<HTMLElement>('#sample-area');
  const ping = document.querySelector<HTMLButtonElement>('#ping');
  const overview = document.querySelector<HTMLInputElement>('#overview');
  const scope = document.querySelector<HTMLElement>('#scope-label');
  if (!source || !title || !answer || !area || !ping || !overview || !scope) return;
  let task: AiTask = 'debug';
  let answered = false;
  function showAnswer() {
    if (!answer) return;
    answer.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = AI_TASKS.find((t) => t.id === task)!.zh + ' · 示例';
    const body = document.createElement('p');
    body.textContent = SAMPLES[task].answer;
    answer.append(heading, body);
  }
  function render() {
    source!.textContent = SAMPLES[task].source;
    title!.textContent = SAMPLES[task].title;
    area!.classList.toggle('with-overview', overview!.checked);
    scope!.textContent = overview!.checked ? '局部优先 80% · 整体辅助 20%（提示词优先级）' : '只看附近 · 默认仅上传局部';
    if (answered) showAnswer();
  }
  document.querySelectorAll<HTMLButtonElement>('[data-task]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.task;
      if (!AI_TASKS.some((t) => t.id === next)) return;
      task = next as AiTask;
      document.querySelectorAll('[data-task]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      render();
    });
  });
  ping.addEventListener('click', () => { answered = true; area.classList.add('has-ping'); showAnswer(); });
  overview.addEventListener('change', render);
  render();
}
