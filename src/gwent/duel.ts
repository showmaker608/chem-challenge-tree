import { createGame, freshTactics } from './engine';
import type { Card, Game } from './engine';
import { pool } from './onboarding';

export const DECK_SIZE = 16;
const keys = ['carbonate', 'acid', 'limewater', 'peroxide', 'catalyst', 'splint', 'copper', 'iron', 'nitrogen', 'silica'];
export const collection: Card[] = [
  ...pool.map((c, i): Card => ({ ...c, id: keys[i], key: keys[i], ability: 'unit', row: 0 })),
  { id: 'measure', key: 'measure', name: '精密测量', symbol: '强化', power: 0, row: 0, ability: 'tactic', skill: 'measure', fact: '选择己方一张未反应、未获奖励的物质牌，本局 +3 分。同一张牌不能重复强化。' },
  { id: 'challenge', key: 'challenge', name: '成果质疑', symbol: '干扰', power: 0, row: 0, ability: 'tactic', skill: 'challenge', fact: '选择对方一张有组合奖励的物质牌，扣除其组合奖励，直到复核或本局结束。不影响基础分和已经发生的化学事实。' },
  { id: 'review', key: 'review', name: '实验复核', symbol: '反制', power: 0, row: 0, ability: 'tactic', skill: 'review', fact: '选择己方一张奖励待复核的物质牌，解除成果质疑，恢复它的组合奖励。' },
  { id: 'relay', key: 'relay', name: '紧急调度', symbol: '调度', power: 0, row: 0, ability: 'tactic', skill: 'relay', fact: '收回己方一张未反应、未获奖励的物质牌，同时从手牌换上一张物质牌。已参与反应的催化剂也不能收回。战术牌用后弃置。' },
  { id: 'mentor', key: 'mentor', name: '实验导师', symbol: '英雄', power: 5, row: 0, ability: 'hero', skill: 'mentor', fact: '在场期间，己方首次完成一次新的检验接力，导师额外 +2 分。每局一次；不会追溯入场前的检验。' },
  { id: 'witness', key: 'witness', name: '见证者', symbol: '英雄', power: 5, row: 0, ability: 'hero', skill: 'witness', fact: '在场期间，自动替己方物质牌挡下一次成果质疑。每局一次；不能解除入场前的质疑。' },
  { id: 'spy', key: 'spy', name: '访问学者', symbol: '间谍', power: 4, row: 0, ability: 'spy', fact: '进入对方实验台，给对方 4 分；自己从备用牌库抽 2 张。不足两张时有多少抽多少。不查看或偷取对方手牌。' },
];
export const cardByKey = new Map(collection.map(c => [c.key!, c]));
export const presets = [
  { name: '反应接力', description: '两条实验链 · 导师奖励', cards: [...keys, 'carbonate', 'acid', 'mentor', 'spy', 'challenge', 'review'] },
  { name: '守证反击', description: '见证守护 · 质疑与复核', cards: [...keys, 'copper', 'witness', 'spy', 'challenge', 'review', 'measure'] },
  { name: '灵活调度', description: '物质轮换 · 留牌博弈', cards: [...keys, 'peroxide', 'catalyst', 'spy', 'mentor', 'relay', 'measure'] },
];
export function deckErrors(keys: string[]): string[] {
  const cards = keys.map(k => cardByKey.get(k));
  const errors: string[] = [];
  if (keys.length !== DECK_SIZE) errors.push(`牌组需要 ${DECK_SIZE} 张，目前 ${keys.length} 张`);
  if (cards.some(c => !c)) errors.push('包含不存在的卡牌');
  if (keys.some(k => keys.filter(x => x === k).length > (cardByKey.get(k)?.ability === 'unit' ? 2 : 1))) errors.push('物质同名最多 2 张，其他同名最多 1 张');
  if (cards.filter(c => c?.ability === 'hero').length > 1) errors.push('英雄最多 1 张');
  if (cards.filter(c => c?.ability === 'unit').length < 10) errors.push('至少需要 10 张物质牌');
  if (cards.filter(c => c?.ability === 'tactic').length > 4) errors.push('战术牌最多 4 张');
  return errors;
}
export function readDeck(raw: string | null): string[] {
  try { const saved: unknown = JSON.parse(raw || 'null'); if (Array.isArray(saved) && saved.every(k => typeof k === 'string') && !deckErrors(saved).length) return saved; } catch { /* Recover only this game's deck preference. */ }
  return [...presets[0].cards];
}
export function createDuel(keys: string[], opponent: string[], random = Math.random): Game {
  if (deckErrors(keys).length || deckErrors(opponent).length) throw new Error('Invalid constructed deck');
  const g = createGame(random); g.duel = true; g.tactics = freshTactics(); g.experiments = [[], []];
  g.players.forEach((p, side) => {
    const cards = (side === 0 ? keys : opponent).map((key, i) => ({ ...cardByKey.get(key)!, id: `duel-${side}-${i}` }));
    for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    p.hand = cards.splice(0, 10); p.deck = cards; p.board = []; p.discard = []; p.horns = []; p.passed = false; p.leader = false; p.lives = 2;
  });
  g.phase = 'mulligan'; g.log = ['构筑对决：10 张起手，6 张备用；最多换 2 张，局间不自动补牌。']; return g;
}
export function opponentFor(keys: string[]): typeof presets[number] {
  const signature = [...keys].sort().join(',');
  return presets.find(p => [...p.cards].sort().join(',') !== signature)!;
}
