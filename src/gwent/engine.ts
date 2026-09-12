export type Row = 0 | 1 | 2;
export type Side = 0 | 1;
export type Ability = 'unit' | 'bond' | 'spy' | 'hero' | 'tactic' | 'weather' | 'clear' | 'horn' | 'scorch';
export type Skill = 'measure' | 'challenge' | 'review' | 'relay' | 'mentor' | 'witness';
export interface Card { id: string; key?: string; skill?: Skill; name: string; symbol: string; power: number; row: Row; ability: Ability; fact: string; reagent?: 'peroxide' | 'catalyst'; chemical?: 'carbonate' | 'acid' | 'peroxide' | 'catalyst' | 'limewater' | 'splint' | 'metal' | 'flame' }
export interface Experiment { id: string; kind: 'oxygen' | 'carbon' | 'hydrogen'; cards: string[]; product: 'O₂' | 'CO₂' | 'H₂'; testedBy?: string }
export interface Chain { kind: Experiment['kind']; materials: [string, string]; product: Experiment['product']; tester: string }
export const chains: Chain[] = [
  { kind: 'carbon', materials: ['carbonate', 'acid'], product: 'CO₂', tester: 'limewater' },
  { kind: 'oxygen', materials: ['peroxide', 'catalyst'], product: 'O₂', tester: 'splint' },
  { kind: 'hydrogen', materials: ['metal', 'acid'], product: 'H₂', tester: 'flame' },
];
export const chainNames: Record<string, string> = { carbonate: '碳酸钙', acid: '稀盐酸', limewater: '澄清石灰水', peroxide: '过氧化氢溶液', catalyst: '二氧化锰', splint: '带火星的木条', metal: '铁钉/镁带', flame: '燃着的木条' };
export const chainBonus = (kind: Experiment['kind']) => kind === 'carbon' ? 2 : 4;
/** Human-readable combo hints for a card's chemical role; shown in the card detail dialog. */
export function comboInfo(chemical?: string): string[] {
  if (!chemical) return [];
  const lines: string[] = [];
  for (const ch of chains) {
    const mi = ch.materials.indexOf(chemical);
    if (mi >= 0) lines.push(`与「${chainNames[ch.materials[1 - mi]]}」配合生成${ch.product}（各 +${chainBonus(ch.kind)}），再由「${chainNames[ch.tester]}」检验 +5`);
    if (ch.tester === chemical) lines.push(`检验「${chainNames[ch.materials[0]]}」与「${chainNames[ch.materials[1]]}」生成的${ch.product}，接力 +5`);
  }
  return lines;
}
export interface Player { hand: Card[]; deck: Card[]; board: Card[]; discard: Card[]; horns: Row[]; lives: number; passed: boolean; leader: boolean }
export interface Tactics { boosts: Record<string, number>; disputed: string[]; mentorUsed: Side[]; witnessUsed: Side[] }
export type AIStyle = 'rush' | 'relay' | 'guard';
export interface Game { players: [Player, Player]; weather: Row[]; turn: Side; starter: Side; round: number; phase: 'mulligan' | 'play' | 'round' | 'over'; swaps: number; swapped: string[]; log: string[]; result: string; experiments?: [Experiment[], Experiment[]]; duel?: boolean; tactics?: Tactics; opponentId?: AIStyle }
export const freshTactics = (): Tactics => ({ boosts: {}, disputed: [], mentorUsed: [], witnessUsed: [] });
export function cardState(g: Game, side: Side, c: Card): string {
  if (g.tactics?.disputed.includes(c.id)) return '奖励待复核';
  if (c.skill === 'mentor') return g.tactics?.mentorUsed.includes(side) ? '指导完成' : '等待检验';
  if (c.skill === 'witness') return g.tactics?.witnessUsed.includes(side) ? '守护已用' : '守护就绪';
  if (c.ability === 'spy') return '对手派来的间谍';
  const records = g.experiments?.[side] || [];
  if (records.some(e => e.testedBy === c.id)) return c.chemical === 'limewater' ? '已反应 · 变浑浊' : c.chemical === 'flame' ? '已检验 · 爆鸣' : '已检验 · 复燃';
  if (records.some(e => e.cards.includes(c.id))) return c.chemical === 'catalyst' ? '催化剂 · 未消耗' : '已反应';
  return c.chemical === 'catalyst' ? '催化剂' : c.chemical === 'limewater' || c.chemical === 'splint' || c.chemical === 'flame' ? '检验待命' : '';
}
function resolveExperiment(g: Game, side: Side) {
  if (!g.experiments) return;
  const records = g.experiments[side];
  for (const chain of chains) {
    if (records.some(e => e.kind === chain.kind)) continue;
    const available = g.players[side].board.filter(x => !records.some(e => e.cards.includes(x.id)));
    const first = available.find(x => x.chemical === chain.materials[0]), second = available.find(x => x.chemical === chain.materials[1]);
    if (first && second) records.push({ id: `${g.round}-${side}-${chain.kind}`, kind: chain.kind, cards: [first.id, second.id], product: chain.product });
  }
  // Prepared inspection materials wait on this side's bench, independent of play order.
  for (const record of records) {
    if (record.testedBy) continue;
    const chain = chains.find(c => c.kind === record.kind)!;
    const tester = g.players[side].board.find(x => x.chemical === chain.tester && !records.some(e => e.testedBy === x.id));
    if (tester) record.testedBy = tester.id;
  }
}
export const rows = ['物质与现象', '微粒与结构', '符号与反应'] as const;
export const labels: Record<Ability, string> = { unit: '物质', bond: '同袍', spy: '间谍', hero: '英雄', tactic: '战术', weather: '天气', clear: '晴天', horn: '号角', scorch: '灼烧' };
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
  if (g.experiments) return g.experiments[side].reduce((sum, e) => sum + (e.cards.includes(c.id) ? chainBonus(e.kind) : 0) + (e.testedBy === c.id ? 5 : 0), 0);
  return reactionPair(g, side).some(x => x.id === c.id) ? 4 : 0;
}
export function power(g: Game, side: Side, c: Card): number {
  const boost = g.tactics?.boosts[c.id] || 0;
  if (c.ability === 'hero') return c.power + boost;
  const p = g.players[side];
  const bond = c.ability === 'bond' ? p.board.filter(x => x.name === c.name && x.row === c.row).length : 1;
  return (g.weather.includes(c.row) ? 1 : c.power) * Math.max(1, bond) * (p.horns.includes(c.row) ? 2 : 1) + boost + (g.tactics?.disputed.includes(c.id) ? 0 : reactionBonus(g, side, c));
}
export const score = (g: Game, side: Side, row?: Row) => g.players[side].board.filter(c => row === undefined || c.row === row).reduce((n, c) => n + power(g, side, c), 0);
export type Action = { type: 'swap'; id: string; with?: string } | { type: 'start' } | { type: 'next' } | { type: 'pass' } | { type: 'leader' } | { type: 'card'; id: string; row?: Row; target?: string; replacement?: string };
export function isUnusedMaterial(g: Game, side: Side, c: Card): boolean {
  return c.ability === 'unit' && !(g.tactics?.boosts[c.id]) && !(g.experiments?.[side] || []).some(e => e.cards.includes(c.id) || e.testedBy === c.id);
}
/** A dispute pauses points for one experiment record; it never undoes chemistry. */
function experimentForCard(g: Game, side: Side, cardId: string): Experiment | undefined {
  return (g.experiments?.[side] || []).find(e => e.cards.includes(cardId) || e.testedBy === cardId);
}
function experimentRewardIds(record: Experiment): string[] {
  return [...record.cards, ...(record.testedBy ? [record.testedBy] : [])];
}
export function skillTargets(g: Game, side: Side, c: Card): Card[] {
  const other: Side = side === 0 ? 1 : 0;
  if (c.skill === 'challenge') return g.players[other].board.filter(x => x.ability === 'unit' && reactionBonus(g, other, x) > 0 && !g.tactics?.disputed.includes(x.id));
  if (c.skill === 'review') return g.players[side].board.filter(x => g.tactics?.disputed.includes(x.id));
  if (c.skill === 'measure' || c.skill === 'relay') return g.players[side].board.filter(x => isUnusedMaterial(g, side, x));
  return [];
}
export function cardActions(g: Game, side: Side, c: Card): Action[] {
  if (c.ability === 'tactic') return skillTargets(g, side, c).flatMap(target => c.skill === 'relay'
    ? g.players[side].hand.filter(x => x.ability === 'unit').map(x => ({ type: 'card' as const, id: c.id, target: target.id, replacement: x.id }))
    : [{ type: 'card' as const, id: c.id, target: target.id }]);
  if (c.ability === 'horn') return ([0, 1, 2] as Row[]).filter(row => !g.players[side].horns.includes(row)).map(row => ({ type: 'card', id: c.id, row }));
  return [{ type: 'card', id: c.id }];
}
export function act(state: Game, action: Action): Game {
  const g: Game = structuredClone(state);
  if (action.type === 'swap') {
    if (g.phase !== 'mulligan' || g.swaps >= 2 || g.swapped.includes(action.id)) return state;
    const p = g.players[0], i = p.hand.findIndex(c => c.id === action.id);
    if (i < 0 || !p.deck.length) return state;
    const j = action.with === undefined ? 0 : p.deck.findIndex(c => c.id === action.with);
    if (j < 0) return state;
    const replacement = p.deck.splice(j, 1)[0]; p.deck.push(p.hand[i]); p.hand[i] = replacement; g.swapped.push(replacement.id); g.swaps++; return g;
  }
  if (action.type === 'start' && g.phase === 'mulligan') { g.phase = 'play'; return g; }
  if (action.type === 'next' && g.phase === 'round') {
    const a = score(g, 0), b = score(g, 1);
    g.starter = a > b ? 0 : b > a ? 1 : g.starter === 0 ? 1 : 0;
    for (const p of g.players) { p.discard.push(...p.board); p.board = []; p.horns = []; p.passed = false; }
    g.weather = []; if (g.experiments) g.experiments = [[], []]; if (g.tactics) g.tactics = freshTactics(); g.round++; g.turn = g.starter; g.phase = 'play'; g.result = ''; return g;
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
    const testedBefore = (g.experiments?.[side] || []).filter(e => e.testedBy).length;
    if (c.ability === 'tactic' && (!g.tactics || !cardActions(g, side, c).some(a => a.type === 'card' && a.target === action.target && a.replacement === action.replacement))) return state;
    if (c.ability === 'horn' && (action.row === undefined || p.horns.includes(action.row))) return state;
    p.hand.splice(i, 1); message = `打出「${c.name}」`;
    if (c.ability === 'tactic') {
      const t = g.tactics!;
      if (c.skill === 'measure') { t.boosts[action.target!] = 4; message += '，精密测量 +4'; }
      if (c.skill === 'challenge') {
        const witness = g.players[other].board.find(x => x.skill === 'witness');
        if (witness && !t.witnessUsed.includes(other)) { t.witnessUsed.push(other); message += '，被见证者挡下'; }
        else {
          const record = experimentForCard(g, other, action.target!);
          if (!record) return state;
          t.disputed.push(...experimentRewardIds(record));
          message += `，${record.product}实验成果奖励待复核`;
        }
      }
      if (c.skill === 'review') {
        const record = experimentForCard(g, side, action.target!);
        if (!record) return state;
        const disputed = new Set(experimentRewardIds(record));
        t.disputed = t.disputed.filter(id => !disputed.has(id));
        message += `，恢复${record.product}实验成果奖励`;
      }
      if (c.skill === 'relay') {
        const target = p.board.find(x => x.id === action.target)!;
        const replacement = p.hand.find(x => x.id === action.replacement)!;
        p.board = p.board.filter(x => x.id !== target.id); p.hand = p.hand.filter(x => x.id !== replacement.id);
        p.hand.push(target); p.board.push(replacement); resolveExperiment(g, side);
        message += `，收回${target.name}，换上${replacement.name}`;
      }
      p.discard.push(c);
    }
    else if (c.ability === 'weather') { if (!g.weather.includes(c.row)) g.weather.push(c.row); p.discard.push(c); }
    else if (c.ability === 'clear') { g.weather = []; p.discard.push(c); }
    else if (c.ability === 'horn') { p.horns.push(action.row!); p.discard.push(c); }
    else if (c.ability === 'scorch') {
      const values = g.players.flatMap((x, s) => x.board.filter(t => t.ability !== 'hero').map(t => power(g, s as Side, t)));
      const highest = Math.max(0, ...values);
      const killed = g.players.map((x, s) => x.board.filter(t => t.ability !== 'hero' && power(g, s as Side, t) === highest).map(t => t.id));
      g.players.forEach((x, s) => { x.discard.push(...x.board.filter(t => killed[s].includes(t.id))); x.board = x.board.filter(t => !killed[s].includes(t.id)); }); p.discard.push(c);
    } else { g.players[c.ability === 'spy' ? other : side].board.push(c); if (c.ability === 'spy') { const drawn = p.deck.splice(0, 2); p.hand.push(...drawn); message += `，抽取 ${drawn.length} 张牌`; } else resolveExperiment(g, side); }
    if (g.tactics && !g.tactics.mentorUsed.includes(side) && (g.experiments?.[side] || []).filter(e => e.testedBy).length > testedBefore) {
      const mentor = p.board.find(x => x.skill === 'mentor');
      if (mentor) { g.tactics.mentorUsed.push(side); g.tactics.boosts[mentor.id] = 2; message += '，实验导师指导 +2'; }
    }
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
function chainProgress(before: Game, after: Game, side: Side) {
  const was = before.experiments?.[side] || [], now = after.experiments?.[side] || [];
  return {
    created: now.filter(e => !was.some(old => old.id === e.id)).length,
    tested: now.filter(e => e.testedBy && !was.some(old => old.id === e.id && old.testedBy)).length,
  };
}
function isTester(c: Card) { return c.chemical === 'limewater' || c.chemical === 'splint' || c.chemical === 'flame'; }
function canFinishOwnChain(g: Game, side: Side) {
  const chemicals = new Set<string | undefined>([...g.players[side].hand, ...g.players[side].board].map(c => c.chemical));
  return chains.some(chain => chain.materials.every(material => chemicals.has(material)) && chemicals.has(chain.tester));
}
// Evaluates only the AI hand and public board, never the player's hidden cards.
// Each style changes priorities and when it gives up a round; no style receives hidden information.
export function chooseAI(g: Game, opts: { level?: 'easy' | 'normal'; random?: () => number; style?: AIStyle } = {}): Action {
  const level = opts.level ?? 'normal', random = opts.random ?? Math.random;
  const style = opts.style ?? g.opponentId ?? 'rush';
  const s = g.turn, other: Side = s === 0 ? 1 : 0, p = g.players[s], enemy = g.players[other];
  const margin = score(g, s) - score(g, other);
  if (enemy.passed && margin > 0) return { type: 'pass' };
  const actions: Action[] = p.hand.flatMap(c => cardActions(g, s, c));
  if (p.leader && g.weather.length) actions.push({ type: 'leader' });
  const rated = actions.map(action => {
    const next = act(g, action), gain = score(next, s) - score(next, other) - margin;
    const draw = next.players[s].hand.length - p.hand.length + (action.type === 'card' ? 1 : 0);
    const played = action.type === 'card' ? p.hand.find(c => c.id === action.id) : undefined;
    const progress = chainProgress(g, next, s);
    let value = gain + (enemy.passed ? 2 : 7) * draw;
    if (style === 'rush') value += gain * 1.4 + (played?.ability === 'spy' ? 3 : 0);
    if (style === 'relay') {
      value += progress.created * 12 + progress.tested * 24;
      // A tester is deliberately held until there is gas to inspect.
      if (played && isTester(played) && !progress.tested) value -= 13;
      if (played?.skill === 'relay') value += 5;
    }
    if (style === 'guard') {
      if (played?.skill === 'challenge') value += 22;
      if (played?.skill === 'review') value += 18;
      if (played?.skill === 'witness' && !g.tactics?.witnessUsed.includes(s)) value += canFinishOwnChain(g, s) ? 12 : 4;
      value += progress.tested * 9;
    }
    return { action, gain, value };
  }).sort((a, b) => b.value - a.value);
  if (!rated.length) return { type: 'pass' };
  if (enemy.passed) { const enough = rated.filter(x => margin + x.gain > 0).sort((a, b) => a.gain - b.gain); if (enough.length) return enough[0].action; }
  // The relay player consciously drops a costly round to keep a complete chain for later.
  if (style === 'relay' && !enemy.passed && p.lives > 1 && margin <= -10 && canFinishOwnChain(g, s)) return { type: 'pass' };
  if (level === 'normal' && !enemy.passed && p.lives > 1 && ((margin < -16 && p.hand.length <= enemy.hand.length + 1) || (margin > 12 && p.hand.length < enemy.hand.length))) return { type: 'pass' };
  if (rated[0].value <= 0 && margin >= 0) return { type: 'pass' };
  if (level === 'easy') { const sloppy = rated.filter(x => x.value > 0).slice(0, 3); if (sloppy.length) return sloppy[Math.floor(random() * sloppy.length)].action; }
  return rated[0].action;
}
