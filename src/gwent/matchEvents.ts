import { chainBonus, score } from './engine';
import type { Action, Game, Side } from './engine';

export type MatchEvent = {
  id: string;
  actor: Side;
  title: string;
  detail: string;
  youDelta: number;
  computerDelta: number;
  emphasis: 'normal' | 'swing' | 'protect';
};

const actorName = (side: Side) => side === 0 ? '你' : '电脑';
const signed = (value: number) => `${value > 0 ? '+' : ''}${value}`;
const publicCard = (game: Game, side: Side, id?: string) => id ? game.players[side].board.find(card => card.id === id) : undefined;

function scoreChange(before: Game, next: Game) {
  return { you: score(next, 0) - score(before, 0), computer: score(next, 1) - score(before, 1) };
}

function scoreDetail(change: ReturnType<typeof scoreChange>) {
  return `分数变化：你 ${signed(change.you)} · 电脑 ${signed(change.computer)}`;
}

function reversal(before: Game, next: Game): boolean {
  const oldMargin = score(before, 0) - score(before, 1);
  const newMargin = score(next, 0) - score(next, 1);
  return (oldMargin < 0 && newMargin > 0) || (oldMargin > 0 && newMargin < 0);
}

/**
 * Converts an executed move into information both players are already entitled
 * to see: the played card, public target/result, and score change. It never
 * reads a hand other than to identify the card that has just been played.
 */
export function matchEvent(before: Game, next: Game, action: Action): MatchEvent | null {
  if (action.type === 'start' || action.type === 'next' || action.type === 'swap') return null;
  const actor = before.turn;
  const change = scoreChange(before, next);
  const base = { id: `${next.round}-${next.log.length}-${actor}`, actor, youDelta: change.you, computerDelta: change.computer };

  if (action.type === 'pass') {
    return { ...base, title: `${actorName(actor)}收手`, detail: `本局停牌，保留 ${next.players[actor].hand.length} 张手牌。`, emphasis: 'normal' };
  }
  if (action.type === 'leader') {
    return { ...base, title: `${actorName(actor)}使用领袖`, detail: `清除全部天气。${scoreDetail(change)}`, emphasis: reversal(before, next) ? 'swing' : 'normal' };
  }

  const card = before.players[actor].hand.find(item => item.id === action.id);
  if (!card) return null;
  const targetSide: Side = actor === 0 ? 1 : 0;
  const target = publicCard(before, card.skill === 'challenge' ? targetSide : actor, action.target);
  const created = (next.experiments?.[actor] || []).find(record => !(before.experiments?.[actor] || []).some(old => old.id === record.id));
  const tested = (next.experiments?.[actor] || []).find(record => record.testedBy && !before.experiments?.[actor]?.some(old => old.id === record.id && old.testedBy));
  const protectedChallenge = card.skill === 'challenge' && (next.tactics?.witnessUsed.length || 0) > (before.tactics?.witnessUsed.length || 0);

  let title = `${actorName(actor)}打出「${card.name}」`;
  let detail = scoreDetail(change);
  let emphasis: MatchEvent['emphasis'] = reversal(before, next) ? 'swing' : 'normal';
  if (protectedChallenge) {
    title = `${actorName(actor)}的质疑被保护`;
    detail = `见证者挡下对「${target?.name ?? '该物质'}」的成果质疑。${scoreDetail(change)}`;
    emphasis = 'protect';
  } else if (card.skill === 'challenge') {
    title = `${actorName(actor)}发起成果质疑`;
    detail = `「${target?.name ?? '该物质'}」的组合奖励暂时待复核（-${chainBonus((next.experiments?.[targetSide] || []).find(record => record.cards.includes(action.target || ''))?.kind || 'carbon')}）。${scoreDetail(change)}`;
  } else if (card.skill === 'review') {
    title = `${actorName(actor)}完成实验复核`;
    detail = `恢复「${target?.name ?? '该物质'}」的组合奖励。${scoreDetail(change)}`;
  } else if (card.skill === 'measure') {
    title = `${actorName(actor)}使用精密测量`;
    detail = `「${target?.name ?? '该物质'}」本局 +3。${scoreDetail(change)}`;
  } else if (card.skill === 'relay') {
    const replacement = before.players[actor].hand.find(item => item.id === action.replacement);
    title = `${actorName(actor)}紧急调度`;
    detail = `收回「${target?.name ?? '一张物质牌'}」，换上「${replacement?.name ?? '一张物质牌'}」。${scoreDetail(change)}`;
  } else if (card.ability === 'spy') {
    const drawn = next.players[actor].hand.length - before.players[actor].hand.length + 1;
    detail = `进入对方实验台，对方 +4；${actorName(actor)}抽 ${drawn} 张备用牌。${scoreDetail(change)}`;
  } else if (tested) {
    title = `${actorName(actor)}完成${tested.product}检验`;
    detail = `检验接力 +5。${scoreDetail(change)}`;
  } else if (created) {
    title = `${actorName(actor)}完成制气`;
    detail = `生成 ${created.product}，组合奖励已计入。${scoreDetail(change)}`;
  }
  if (emphasis === 'swing') detail = `局势反超。${detail}`;
  return { ...base, title, detail, emphasis };
}

/** A factual round recap: selects a logged move by visible score impact, not a claim of causation. */
export function keyRoundEvent(events: MatchEvent[]): MatchEvent | null {
  if (!events.length) return null;
  return events.reduce((best, event) => {
    const importance = (item: MatchEvent) => Math.abs(item.youDelta) + Math.abs(item.computerDelta) + (item.emphasis === 'normal' ? 0 : 6);
    return importance(event) > importance(best) ? event : best;
  });
}
