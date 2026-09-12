import { useState } from 'react';
import { collection, deckErrors, DECK_SIZE, presets } from '../gwent/duel';
import { comboInfo } from '../gwent/engine';
import type { Card } from '../gwent/engine';
import { GwentCardFace } from './GwentCardFace';
import { GwentCardDetails } from './GwentCardDetails';

export function GwentDeckBuilder({ initial, onSave, onClose }: { initial: string[]; onSave: (keys: string[]) => void; onClose: () => void }) {
  const [keys, setKeys] = useState(initial);
  const [filter, setFilter] = useState('全部');
  const [inspect, setInspect] = useState<Card | null>(null);
  const errors = deckErrors(keys), opponents = presets.filter(p => [...p.cards].sort().join(',') !== [...keys].sort().join(','));
  const categories = ['全部', '物质', '战术', '英雄', '间谍'];
  const kind = (c: Card) => c.ability === 'unit' ? '物质' : c.ability === 'tactic' ? '战术' : c.ability === 'hero' ? '英雄' : '间谍';
  function add(c: Card) { setKeys([...keys, c.key!]); }
  function remove(c: Card) { const i = keys.indexOf(c.key!); if (i >= 0) setKeys(keys.filter((_, n) => n !== i)); }
  return <section className="cg-deckbuilder" aria-label="组建牌组">
    <div className="cg-builder-heading"><div><span className="cg-kicker">BUILD YOUR DECK</span><h2>你的实验，你来组牌。</h2><p>起手 10 张 · 备用 6 张 · 点卡看说明</p></div><button onClick={onClose}>返回</button></div>
    <div className="cg-presets">{presets.map(p => <button key={p.name} onClick={() => setKeys([...p.cards])}>{p.name}<small>{p.description}</small></button>)}</div>
    <div className="cg-deck-count"><strong>已选 {keys.length} / {DECK_SIZE}</strong><span>物质 {keys.filter(k => collection.find(c => c.key === k)?.ability === 'unit').length} · 英雄 {keys.filter(k => collection.find(c => c.key === k)?.ability === 'hero').length}</span><button onClick={() => setKeys([])}>清空选择</button></div>
    <nav className="cg-filters" aria-label="卡牌分类">{categories.map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>)}</nav>
    <div className="cg-builder-layout"><div className="cg-collection">{collection.filter(c => filter === '全部' || kind(c) === filter).map(c => {
      const count = keys.filter(k => k === c.key).length, cap = c.ability === 'unit' ? 2 : 1;
      const full = keys.length >= DECK_SIZE || count >= cap || (c.ability === 'hero' && keys.some(k => collection.find(x => x.key === k)?.ability === 'hero'));
      return <article key={c.key} className={`cg-pick ${count ? 'in-deck' : ''}`}><button className={`cg-card cg-kind-${c.ability}`} aria-label={`查看${c.name}说明`} aria-haspopup="dialog" onClick={() => setInspect(c)}><GwentCardFace card={c} /></button><div className="cg-pick-controls"><button aria-label={`移除${c.name}`} disabled={!count} onClick={() => remove(c)}>−</button><span aria-label={`${c.name}已选${count}张`}>{count} / {cap}</span><button aria-label={`加入${c.name}`} disabled={full} onClick={() => add(c)}>＋</button></div></article>;
    })}</div><aside className="cg-builder-info" aria-label="对手与组牌规则"><h3>轮换对手</h3><p>每次自由对战会轮换不同风格；与你牌组完全相同的构筑不会被选中。</p><ul>{opponents.map(opponent => <li key={opponent.id}><strong>{opponent.name}</strong> · {opponent.role}<small>{opponent.description}</small></li>)}</ul><details><summary>查看对手牌组构成</summary>{opponents.map(opponent => <details key={opponent.id}><summary>{opponent.name}</summary><ul>{collection.filter(c => opponent.cards.includes(c.key!)).map(c => <li key={c.key}>{c.name} × {opponent.cards.filter(k => k === c.key).length}</li>)}</ul></details>)}</details><details><summary>组牌规则</summary><p>16 张牌，至少 10 张物质。同名物质最多 2 张，其他同名最多 1 张；英雄最多 1 张，战术最多 4 张。开局随机抽 10 张，可换 2 张；剩余 6 张作为备用，间谍可以抽取。局间不自动补牌。</p><p>牌组只保存在当前浏览器。双方共享可选卡池，但使用不同牌组；对手手牌与抽牌顺序不公开。</p></details></aside></div>
    <div className="cg-builder-footer"><div role="status">{errors.length ? errors.map(e => <p key={e}>{e}</p>) : <p>牌组就绪，下次开局自动使用。</p>}</div><button className="primary" disabled={!!errors.length} onClick={() => onSave(keys)}>保存牌组</button></div>
    {inspect && (() => { const count = keys.filter(k => k === inspect.key).length, cap = inspect.ability === 'unit' ? 2 : 1; const full = keys.length >= DECK_SIZE || count >= cap || (inspect.ability === 'hero' && keys.some(k => collection.find(x => x.key === k)?.ability === 'hero')); return <GwentCardDetails card={inspect} onClose={() => setInspect(null)}><div className="cg-pick-controls cg-dialog-controls"><button aria-label={`移除${inspect.name}`} disabled={!count} onClick={() => remove(inspect)}>−</button><span aria-label={`${inspect.name}已选${count}张`}>已选 {count} / {cap}</span><button aria-label={`加入${inspect.name}`} disabled={full} onClick={() => add(inspect)}>＋</button></div></GwentCardDetails>; })()}
  </section>;
}
