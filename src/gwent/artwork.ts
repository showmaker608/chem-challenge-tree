import type { Card } from './engine';

export function gameAsset(name: string): string {
  return `${import.meta.env?.BASE_URL || '/'}gwent/${name}`;
}

const portraits: Record<string, string> = {
  carbonate: 'carbonate', acid: 'acid', limewater: 'limewater',
  peroxide: 'peroxide', catalyst: 'catalyst', splint: 'splint',
  Cu: 'copper', Fe: 'iron', 'N₂': 'nitrogen', 'SiO₂': 'silica',
  mentor: 'mentor', witness: 'witness', spy: 'spy',
  copper: 'copper', iron: 'iron', nitrogen: 'nitrogen', silica: 'silica',
};

/** Text and chemistry remain in the UI; portraits are artistic personifications. */
export function cardPortrait(card: Pick<Card, 'chemical' | 'symbol' | 'key'>): string | undefined {
  const name = portraits[card.key || card.chemical || card.symbol];
  return name ? gameAsset(`${name}-v2.webp`) : undefined;
}
