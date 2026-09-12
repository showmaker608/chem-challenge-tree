import { comboInfo, labels } from '../gwent/engine';
import type { Card } from '../gwent/engine';
import { GwentCardFace } from './GwentCardFace';

export function GwentCardDetails({ card, onClose, children }: { card: Card; onClose: () => void; children?: React.ReactNode }) {
  const isMaterial = card.ability === 'unit' || card.ability === 'bond';
  const combos = comboInfo(card.chemical);
  return <div className="cg-overlay" onClick={onClose}>
    <section className="cg-dialog cg-card-details" role="dialog" aria-modal="true" aria-label={`${card.name}卡牌说明`} onClick={e => e.stopPropagation()}>
      <div className="cg-inspect-art"><div className={`cg-card cg-kind-${card.ability}`} aria-hidden="true"><GwentCardFace card={card} /></div></div>
      <h2>{card.name} · {card.symbol}</h2>
      <p className="cg-detail-kind">{labels[card.ability]}牌{isMaterial ? ` · 基础 ${card.power} 分` : ''}</p>
      {!isMaterial && <p className="cg-detail-effect">{card.fact}</p>}
      {combos.map(line => <p key={line} className="cg-detail-combo">⚗ {line}</p>)}
      {isMaterial && <p className="cg-detail-fact">{card.fact}</p>}
      {children}
      <button autoFocus onClick={onClose}>知道了</button>
    </section>
  </div>;
}
