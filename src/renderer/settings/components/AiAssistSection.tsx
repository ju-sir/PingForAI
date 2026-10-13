import { Dropdown, Option, Textarea } from '@fluentui/react-components';
import { Sparkle24Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import type { PingId } from '../../../shared/pings';
import type { AiSignalAction, AiSignalConfig, Settings } from '../../../shared/settings';
import type { Update } from '../useAppState';
import { useText } from '../text';

const ACTIONS: AiSignalAction[] = ['off', 'show', 'copy', 'showAndCopy'];

export function AiAssistSection({ settings, update }: { settings: Settings; update: Update }) {
  const t = useText();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const actionLabel = (action: AiSignalAction): string => ({ off: t.aiOff, show: t.aiShow, copy: t.aiCopy, showAndCopy: t.aiShowAndCopy }[action]);
  const change = (id: PingId, patch: Partial<AiSignalConfig>) => {
    const current = settings.aiSignals[id];
    void update({ aiSignals: { ...settings.aiSignals, [id]: { ...current, ...patch } } });
  };
  return (
    <div className="card aiEditor">
      <div className="aiHead"><Sparkle24Regular className="icon" /><div className="lbl"><b>{t.aiTitle}</b><span className="desc">{t.aiDesc}</span></div></div>
      {Object.entries(settings.aiSignals).map(([id, config]) => {
        const ping = id as PingId;
        const prompt = drafts[id] ?? config.prompt;
        return (
          <div className="aiRow" key={id}>
            <div className="aiName">{t.pingNames[ping]}</div>
            <Dropdown value={actionLabel(config.action)} selectedOptions={[config.action]} onOptionSelect={(_, data) => change(ping, { action: data.optionValue as AiSignalAction })}>
              {ACTIONS.map((action) => <Option key={action} value={action} text={actionLabel(action)}>{actionLabel(action)}</Option>)}
            </Dropdown>
            <Textarea value={prompt} placeholder={t.aiPromptPlaceholder} resize="vertical" rows={2}
              onChange={(_, data) => setDrafts((all) => ({ ...all, [id]: data.value }))}
              onBlur={() => { if (prompt !== config.prompt) change(ping, { prompt }); }} />
          </div>
        );
      })}
      <span className="desc aiHint">{t.aiNotConfigured}</span>
    </div>
  );
}
