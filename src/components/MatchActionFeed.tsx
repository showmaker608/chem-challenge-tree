import type { MatchEvent } from '../gwent/matchEvents';

export function MatchActionFeed({ event }: { event: MatchEvent | null }) {
  if (!event) return null;
  const actor = event.actor === 0 ? '你' : '电脑';
  return <section className={`cg-action-feed cg-action-${event.emphasis}`} aria-live="polite" aria-label="最近动作">
    <span className="cg-action-label">最近动作</span>
    <div><strong>{event.title}</strong><p>{event.detail}</p></div>
    <span className="cg-action-actor">{actor}</span>
  </section>;
}

export function RoundRecap({ event }: { event: MatchEvent | null }) {
  if (!event) return null;
  return <section className="cg-round-recap" aria-label="本局关键操作回顾">
    <strong>本局关键操作回顾</strong>
    <p>{event.title}：{event.detail}</p>
  </section>;
}
