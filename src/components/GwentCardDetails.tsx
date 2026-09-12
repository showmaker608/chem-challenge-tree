import { comboInfo, labels } from '../gwent/engine';
import type { Card } from '../gwent/engine';
import { GwentCardFace } from './GwentCardFace';

function timing(card: Card) {
  if (card.ability === 'tactic') return '在自己的回合选中它后，按提示选择合法目标，再执行战术。战术结算后弃置。';
  if (card.ability === 'spy') return '在自己的回合打出；它会放到对方实验台，效果立刻结算。';
  if (card.ability === 'hero') return '在自己的回合打出到己方实验台；它留在场上，按牌面条件触发。';
  return '在自己的回合点选后出牌；物质牌会留在己方实验台，等待组合或计分。';
}

function targets(card: Card) {
  switch (card.skill) {
    case 'measure': return '合法目标：己方一张尚未反应、也未拿到组合奖励的物质牌。';
    case 'challenge': return '合法目标：对方一张正在享受组合奖励的物质牌。';
    case 'review': return '合法目标：己方一张标记为“奖励待复核”的物质牌。';
    case 'relay': return '合法目标：己方一张尚未反应、也未拿到组合奖励的物质牌；再从手牌指定一张物质换上。';
    case 'mentor': return '无需指定目标：己方本局第一次完成新的检验接力时自动触发。';
    case 'witness': return '无需指定目标：对方首次质疑己方组合奖励时自动触发。';
    default: return card.ability === 'spy' ? '不需要选择目标；它固定进入对方实验台。' : '不需要选择额外目标。';
  }
}

function example(card: Card) {
  if (card.skill === 'measure') return '例：一张基础 5 分、尚未反应的物质牌被强化后，本局显示为 8 分。';
  if (card.skill === 'challenge') return '例：对手通过制气获得的 +4 组合奖励会暂时扣除；牌本身基础分不变，化学反应也没有被“取消”。';
  if (card.skill === 'review') return '例：己方被质疑的组合牌复核后，恢复先前扣掉的组合奖励。';
  if (card.skill === 'relay') return '例：收回一张尚未参与反应的铜牌，再指定手里的碳酸钙上场；两张牌都由玩家自己选。';
  if (card.skill === 'mentor') return '例：导师在场时，己方首次完成气体检验接力，除接力 +5 外，导师再 +2。';
  if (card.skill === 'witness') return '例：对方第一次使用成果质疑时，见证者会挡下这一次；下一次质疑才可能生效。';
  if (card.ability === 'spy') return '例：访问学者给对方实验台增加 4 分，但你从自己的备用牌抽最多 2 张。';
  if (card.chemical) return comboInfo(card.chemical)[0] || '例：这张物质先按基础分计入；满足实验链条件时，组合奖励另行显示。';
  return `例：打出后先按牌面 ${card.power} 分计入；其他奖励以场上条件为准。`;
}

export function GwentCardDetails({ card, onClose, children }: { card: Card; onClose: () => void; children?: React.ReactNode }) {
  const chemistry = card.ability === 'tactic' || card.ability === 'spy'
    ? '这是一张游戏规则牌：不会改变已发生的化学反应、物质性质或实验事实。'
    : card.fact;
  return <div className="cg-overlay" onClick={onClose}>
    <section className="cg-dialog cg-card-details" role="dialog" aria-modal="true" aria-label={`${card.name}卡牌说明`} onClick={e => e.stopPropagation()}>
      <div className="cg-inspect-art"><div className={`cg-card cg-kind-${card.ability}`} aria-hidden="true"><GwentCardFace card={card} /></div></div>
      <h2>{card.name} · {card.symbol}</h2>
      <p className="cg-detail-kind">{labels[card.ability]}牌</p>
      <section><h3>化学事实</h3><p>{chemistry}</p></section>
      <section><h3>游戏作用</h3><p>{card.ability === 'unit' || card.ability === 'bond' ? `基础 ${card.power} 分；${comboInfo(card.chemical).join('；') || '可和场上规则共同决定最终分数。'}` : card.fact}</p></section>
      <section><h3>何时使用与合法目标</h3><p>{timing(card)}</p><p>{targets(card)}</p></section>
      <section><h3>数值例子</h3><p>{example(card)}</p></section>
      {children}
      <button autoFocus onClick={onClose}>知道了</button>
    </section>
  </div>;
}
