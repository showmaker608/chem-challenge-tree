import type { Game } from './engine';
import { createLesson } from './onboarding';
import { createDuel, opponentFor } from './duel';

export const INTRO_KEY = 'chem-gwent-intro-v1';
export function createQuickMatch(keys: string[], returning: boolean): Game {
  return returning ? createDuel(keys, opponentFor(keys).cards) : createLesson('bond');
}

// One contextual hint at a time; never prevents a legal move.
export function quickHint(g: Game): string | null {
  if (g.phase === 'over' || g.phase === 'mulligan') return null;
  if (g.phase === 'round') return '下一局会清场，但手牌不补充。留住的牌，就是下一局的机会。';
  if (g.players[0].passed) return '你已收手，剩余手牌留给下一局。';
  if (g.turn !== 0) return null;
  if (g.players[1].passed) return '对手已收手。领先就能拿下这局，也可以让局留牌。';
  const records = g.experiments?.[0] || [];
  if (records.some(e => !e.testedBy)) return '生成气体了，如何检验呢？试着接上合适的检验牌。';
  if (records.some(e => e.testedBy)) return '接力完成！继续追分，还是收手留牌？由你决定。';
  if (!g.players[0].board.length) return '先选一张手牌，再点“出牌”。场上总分高的一方赢下本局。';
  return '不同物质会触发额外奖励。试试让碳酸钙与稀盐酸相遇。';
}
