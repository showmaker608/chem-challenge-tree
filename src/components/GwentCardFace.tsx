import type { Card } from '../gwent/engine';
import { cardPortrait, gameAsset } from '../gwent/artwork';
const emblems: Record<string, string> = {
  measure: 'M25 65V30h18v35m-14-25h8m-8 10h8M20 70h30M60 30v40m-10-25h20m-10-15-5 8m5-8 5 8',
  challenge: 'M50 18 78 30v23c0 15-28 29-28 29S22 68 22 53V30ZM50 35v22m0 9v2',
  review: 'M28 28a30 30 0 1 1-8 30M28 15v18H10m24 17 11 11 22-24',
  relay: 'M20 34h60L65 19M80 66H20l15 15M20 34l15 15M80 66 65 51',
};
export function GwentCardFace({ card, value = card.power, state = '' }: { card: Card; value?: number; state?: string }) {
  const portrait = cardPortrait(card);
  return <><img className="cg-frame" src={gameAsset('card-frame-v2.webp')} alt="" aria-hidden="true" />
    <span className="cg-power" style={{ backgroundImage: `url('${gameAsset('life-orb-v2.webp')}')` }}>{card.ability === 'tactic' ? '✦' : value}</span>
    <span className={`cg-art ${card.ability === 'tactic' ? 'cg-tactic-art' : ''}`} aria-hidden="true" style={{ backgroundImage: portrait ? `url('${portrait}')` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {card.ability === 'tactic' && <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="50" cy="50" r="44" strokeWidth="1" /><path d={emblems[card.skill || '']} /></svg>}
    </span>
    <span className="cg-symbol">{card.symbol}</span><strong>{card.name}</strong>
    <small>{state || (card.ability === 'spy' ? '潜入 · 抽 2 张' : card.chemical === 'catalyst' ? '催化剂' : '')}</small>
    {value !== card.power && <span className={`cg-equation ${value < card.power ? 'negative' : ''}`}>{value > card.power ? '+' : ''}{value - card.power}</span>}
  </>;
}
