export type Row = 0 | 1 | 2;
export type Side = 0 | 1;
export type Ability = 'unit' | 'bond' | 'spy' | 'hero' | 'weather' | 'clear' | 'horn' | 'scorch';
export interface Card { id: string; name: string; symbol: string; power: number; row: Row; ability: Ability; fact: string; reagent?: 'peroxide' | 'catalyst' }
export interface Player { hand: Card[]; deck: Card[]; board: Card[]; discard: Card[]; horns: Row[]; lives: number; passed: boolean; leader: boolean }
export interface Game { players: [Player, Player]; weather: Row[]; turn: Side; starter: Side; round: number; phase: 'mulligan' | 'play' | 'round' | 'over'; swaps: number; swapped: string[]; log: string[]; result: string }
export const rows = ['物质与现象', '微粒与结构', '符号与反应'] as const;
export const labels: Record<Ability, string> = { unit: '单位', bond: '同袍', spy: '间谍', hero: '英雄', weather: '天气', clear: '晴天', horn: '号角', scorch: '灼烧' };
export function deck(prefix: string): Card[] {
  const cards: Card[] = [];
  function add(name: string, symbol: string, power: number, row: Row, ability: Ability, fact: string, count = 1) {
    for (let i = 0; i < count; i++) cards.push({ id: `${prefix}-${cards.length}`, name, symbol, power, row, ability, fact });
  }
  add('铁', 'Fe', 4, 0, 'bond', '铁属于金属单质。', 3);
  add('铜', 'Cu', 6, 0, 'unit', '铜具有良好的导电性。', 3);
  add('氧气', 'O₂', 4, 1, 'bond', '氧气能支持燃烧，本身不具有可燃性。', 3);
  add('氮气', 'N₂', 5, 1, 'unit', '空气中氮气的体积分数约为 78%。', 3);
  add('碳酸钙', 'CaCO₃', 5, 2, 'bond', '碳酸钙是石灰石的主要成分。', 2);
  add('二氧化硅', 'SiO₂', 6, 2, 'unit', '二氧化硅属于氧化物。', 3);
  add('氢气', 'H₂', 4, 0, 'spy', '氢气具有可燃性，点燃前需要验纯。', 2);
  add('二氧化碳', 'CO₂', 5, 1, 'spy', '二氧化碳能使澄清石灰水变浑浊。');
  add('守恒之星', '⚖', 10, 2, 'hero', '化学反应前后，参加反应的各物质质量总和等于生成的各物质质量总和。');
  add('微粒之眼', '◎', 10, 0, 'hero', '化学反应前后，原子的种类和数目不变。');
  add('刺骨冰霜', '❄', 0, 0, 'weather', '游戏天气：双方近战排普通单位基础分变为 1。');
  add('浓雾', '≋', 0, 1, 'weather', '游戏天气：双方远程排普通单位基础分变为 1。');
  add('暴雨', '☂', 0, 2, 'weather', '游戏天气：双方攻城排普通单位基础分变为 1。');
  add('晴天', '☀', 0, 0, 'clear', '游戏效果：清除所有天气。');
  add('指挥号角', '⚑', 0, 0, 'horn', '游戏效果：所选排普通单位分数翻倍，不叠加。', 2);
  add('灼烧', '♨', 0, 0, 'scorch', '游戏效果：摧毁双方当前分数最高的所有普通单位。');
  return cards;
}
function shuffle<T>(items: T[], random: () => number): T[] { const a = [...items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function createGame(random = Math.random): Game {
  const makePlayer = (i: number): Player => { const d = shuffle(deck(String(i)), random); return { hand: d.splice(0, 10), deck: d, board: [], discard: [], horns: [], lives: 2, passed: false, leader: true }; };
  const players: [Player, Player] = [makePlayer(0), makePlayer(1)];
  const starter: Side = random() < .5 ? 0 : 1;
  return { players, weather: [], turn: starter, starter, round: 1, phase: 'mulligan', swaps: 0, swapped: [], log: ['抛硬币：' + (starter === 0 ? '你' : '电脑') + '先手。'], result: '' };
}
export function reactionPair(g: Game, side: Side): Card[] {
  const board = g.players[side].board;
  const peroxide = board.find(c => c.reagent === 'peroxide');
  const catalyst = board.find(c => c.reagent === 'catalyst' && c.row === peroxide?.row);
  return peroxide && catalyst ? [peroxide, catalyst] : [];
}
export function reactionBonus(g: Game, side: Side, c: Card): number {
  return reactionPair(g, side).some(x => x.id === c.id) ? 4 : 0;
}
export function power(g: Game, side: Side, c: Card): number {
  if (c.ability === 'hero') return c.power;
  const p = g.players[side];
  const bond = c.ability === 'bond' ? p.board.filter(x => x.name === c.name && x.row === c.row).length : 1;
  return (g.weather.includes(c.row) ? 1 : c.power) * Math.max(1, bond) * (p.horns.includes(c.row) ? 2 : 1) + reactionBonus(g, side, c);
}
export const score = (g: Game, side: Side, row?: Row) => g.players[side].board.filter(c => row === undefined || c.row === row).reduce((n, c) => n + power(g, side, c), 0);
export type Action = { type: 'swap'; id: string } | { type: 'start' } | { type: 'next' } | { type: 'pass' } | { type: 'leader' } | { type: 'card'; id: string; row?: Row };
export function act(state: Game, action: Action): Game {
  const g: Game = structuredClone(state);
  if (action.type === 'swap') {
    if (g.phase !== 'mulligan' || g.swaps >= 2 || g.swapped.includes(action.id)) return state;
    const p = g.players[0], i = p.hand.findIndex(c => c.id === action.id);
    if (i < 0 || !p.deck.length) return state;
    const replacement = p.deck.shift()!; p.deck.push(p.hand[i]); p.hand[i] = replacement; g.swapped.push(replacement.id); g.swaps++; return g;
  }
  if (action.type === 'start' && g.phase === 'mulligan') { g.phase = 'play'; return g; }
  if (action.type === 'next' && g.phase === 'round') {
    const a = score(g, 0), b = score(g, 1);
    g.starter = a > b ? 0 : b > a ? 1 : g.starter === 0 ? 1 : 0;
    for (const p of g.players) { p.discard.push(...p.board); p.board = []; p.horns = []; p.passed = false; }
    g.weather = []; g.round++; g.turn = g.starter; g.phase = 'play'; g.result = ''; return g;
  }
  if (g.phase !== 'play') return state;
  const side = g.turn, other: Side = side === 0 ? 1 : 0, p = g.players[side];
  if (p.passed) return state;
  let message: string;
  if (action.type === 'pass') { p.passed = true; message = '停牌'; }
  else if (action.type === 'leader') { if (!p.leader) return state; p.leader = false; g.weather = []; message = '使用领袖：清除全部天气'; }
  else if (action.type === 'card') {
    const i = p.hand.findIndex(c => c.id === action.id); if (i < 0) return state;
    const c = p.hand[i];
    if (c.ability === 'horn' && (action.row === undefined || p.horns.includes(action.row))) return state;
    p.hand.splice(i, 1); message = `打出「${c.name}」`;
    if (c.ability === 'weather') { if (!g.weather.includes(c.row)) g.weather.push(c.row); p.discard.push(c); }
    else if (c.ability === 'clear') { g.weather = []; p.discard.push(c); }
    else if (c.ability === 'horn') { p.horns.push(action.row!); p.discard.push(c); }
    else if (c.ability === 'scorch') {
      const values = g.players.flatMap((x, s) => x.board.filter(t => t.ability !== 'hero').map(t => power(g, s as Side, t)));
      const highest = Math.max(0, ...values);
      const killed = g.players.map((x, s) => x.board.filter(t => t.ability !== 'hero' && power(g, s as Side, t) === highest).map(t => t.id));
      g.players.forEach((x, s) => { x.discard.push(...x.board.filter(t => killed[s].includes(t.id))); x.board = x.board.filter(t => !killed[s].includes(t.id)); }); p.discard.push(c);
    } else { g.players[c.ability === 'spy' ? other : side].board.push(c); if (c.ability === 'spy') { const drawn = p.deck.splice(0, 2); p.hand.push(...drawn); message += `，抽取 ${drawn.length} 张牌`; } }
  } else return state;
  g.log = [...g.log.slice(-29), `${side === 0 ? '你' : '电脑'}${message}`];
  if (g.players.every(x => x.passed)) {
    const a = score(g, 0), b = score(g, 1);
    if (a <= b) g.players[0].lives--; if (b <= a) g.players[1].lives--;
    const over = g.players.some(x => x.lives <= 0);
    g.phase = over ? 'over' : 'round';
    g.result = over ? g.players.every(x => x.lives <= 0) ? '平局' : g.players[0].lives > 0 ? '你赢得了整场对决' : '电脑赢得了整场对决' : a === b ? '本局平分，双方各失去一颗宝石' : a > b ? '你赢下本局' : '电脑赢下本局';
    g.log.push(`第 ${g.round} 局：${a} : ${b}，${g.result}`);
  } else g.turn = g.players[other].passed ? side : other;
  return g;
}
// Evaluates only the AI hand and public board, never the player's hidden cards.
export function chooseAI(g: Game): Action {
  const s = g.turn, other: Side = s === 0 ? 1 : 0, p = g.players[s], enemy = g.players[other];
  const margin = score(g, s) - score(g, other);
  if (enemy.passed && margin > 0) return { type: 'pass' };
  const actions: Action[] = p.hand.flatMap(c => c.ability === 'horn' ? ([0, 1, 2] as Row[]).filter(r => !p.horns.includes(r)).map(row => ({ type: 'card' as const, id: c.id, row })) : [{ type: 'card' as const, id: c.id }]);
  if (p.leader && g.weather.length) actions.push({ type: 'leader' });
  const rated = actions.map(action => { const next = act(g, action); const gain = score(next, s) - score(next, other) - margin; const draw = next.players[s].hand.length - p.hand.length + (action.type === 'card' ? 1 : 0); return { action, gain, value: gain + (enemy.passed ? 2 : 7) * draw }; }).sort((a, b) => b.value - a.value);
  if (!rated.length) return { type: 'pass' };
  if (enemy.passed) { const enough = rated.filter(x => margin + x.gain > 0).sort((a, b) => a.gain - b.gain); if (enough.length) return enough[0].action; }
  if (!enemy.passed && p.lives > 1 && ((margin < -16 && p.hand.length <= enemy.hand.length + 1) || (margin > 12 && p.hand.length < enemy.hand.length))) return { type: 'pass' };
  if (rated[0].value <= 0 && margin >= 0) return { type: 'pass' };
  return rated[0].action;
}
