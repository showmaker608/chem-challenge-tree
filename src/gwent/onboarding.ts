import { createGame, score } from './engine';
import type { Action, Card, Game, Row } from './engine';
export type Lesson = 'first' | 'bond' | 'reaction' | 'practice';
export const lessonNames = { first: '1 · 学会出牌与留牌', bond: '2 · 学会同名组合', reaction: '3 · 催化组合', practice: '4 · 轻松对战' };
const themes: [string, string, number, Row, string][] = [
  ['铜丝', 'Cu', 6, 0, '铜呈紫红色，具有良好的导电性。'],
  ['铁钉', 'Fe', 4, 0, '铁属于金属单质。'],
  ['氧分子', 'O₂', 4, 1, '一个氧分子由两个氧原子构成。'],
  ['氮分子', 'N₂', 5, 1, '一个氮分子由两个氮原子构成。'],
  ['水的化学式', 'H₂O', 5, 2, 'H₂O 表示水，也可以表示一个水分子。'],
  ['二氧化碳的化学式', 'CO₂', 6, 2, 'CO₂ 中碳、氧原子个数比为 1∶2。'],
];
export function createLesson(lesson: Lesson): Game {
  const g = createGame();
  g.players.forEach((p, side) => {
    const cards: Card[] = Array.from({ length: 24 }, (_, i) => { const [name, symbol, power, row, fact] = themes[i % themes.length]; return { id: `lesson-${side}-${i}`, name, symbol, power, row, fact, ability: lesson !== 'first' && i % themes.length === 2 ? 'bond' : 'unit' }; });
    // Fixed tutorial hand; practice shuffles. Both sides draw from the same card pool.
    if (lesson === 'practice') for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    if (lesson === 'bond') { const a = cards.findIndex(c => c.id.endsWith('-8')); [cards[1], cards[a]] = [cards[a], cards[1]]; const b = cards.findIndex(c => c.id.endsWith('-2')); [cards[0], cards[b]] = [cards[b], cards[0]]; }
    if (lesson === 'reaction') {
      cards[0] = { id: `reaction-${side}-peroxide`, name: '过氧化氢溶液', symbol: 'H₂O₂', power: 4, row: 0, ability: 'unit', reagent: 'peroxide', fact: '过氧化氢本身也会分解生成水和氧气。加入二氧化锰可加快这一反应。' };
      cards[1] = { id: `reaction-${side}-catalyst`, name: '二氧化锰', symbol: 'MnO₂', power: 2, row: 0, ability: 'unit', reagent: 'catalyst', fact: '二氧化锰在这个反应中作催化剂，反应前后质量和化学性质不变，不是被消耗的反应物。' };
      cards.forEach(c => { c.ability = 'unit'; });
    }
    p.hand = cards.slice(0, 10); p.deck = cards.slice(10); p.board = []; p.discard = []; p.leader = false;
  });
  g.phase = 'play'; g.starter = 0; g.turn = 0; g.log = ['你先出牌。每张牌会自动进入对应区域。'];
  return g;
}
export function easyAI(g: Game, lesson: Lesson): Action {
  const p = g.players[1], enemy = g.players[0];
  if (!p.hand.length || (enemy.passed && score(g, 1) > score(g, 0))) return { type: 'pass' };
  // Teaching opponent makes predictable small commitments; never reads the player's hand.
  const budget = lesson === 'first' ? (g.round === 1 ? 2 : 3) : 3;
  if (!enemy.passed && p.board.length >= budget) return { type: 'pass' };
  if (enemy.passed && p.board.length >= budget + 1) return { type: 'pass' };
  const sorted = [...p.hand].sort((a, b) => a.power - b.power);
  return { type: 'card', id: sorted[0].id };
}
export function guide(g: Game, lesson: Lesson): string {
  if (g.phase === 'over') return '这一场结束了。你已体验过出牌、计分和跨局留牌，可以重练或进入下一课。';
  if (g.phase === 'round') return '这一局的牌会清场，剩余手牌留到下一局；不会重新抽 10 张。';
  if (g.players[0].passed) return '你已停止本局出牌，手里的牌会保留。等对手结束后结算。';
  if (lesson === 'bond' && g.players[0].board.filter(c => c.ability === 'bond').length < 2) return '试着依次打出两张「氧分子」。一张是 4 分；两张同排时，每张 4 × 2 = 8 分，合计 16 分。';
  if (lesson === 'reaction' && !g.players[0].board.some(c => c.reagent === 'peroxide')) return '先打出过氧化氢溶液：它本身也会缓慢分解。再寻找二氧化锰，观察催化作用。';
  if (lesson === 'reaction' && !g.players[0].board.some(c => c.reagent === 'catalyst')) return '选中二氧化锰，场上的搭档会发光。出牌后两张各获 +4 游戏奖励，组合总分变为 14。';
  if (!g.players[0].board.length) return '① 点一张手牌 → ② 点“出牌”。卡牌自动进入对应区域，不需要拖动。';
  if (g.players[1].passed && score(g, 0) > score(g, 1)) return '你已领先，而且对手已停牌。现在点“本局不再出牌”即可拿下这一局，省下剩余手牌。';
  if (g.players[1].passed) return '对手已经停牌。超过对方总分后就可以收手；也可以让出这一局，保留手牌。';
  return '双方三排分数相加，总分高的一方赢本局。想留牌时，点“本局不再出牌”；停牌后本局不能恢复出牌。';
}
