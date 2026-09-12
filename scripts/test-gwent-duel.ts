import assert from 'node:assert/strict';
import { act, cardActions, cardState, chooseAI, comboInfo, power, reactionBonus, score, skillTargets } from '../src/gwent/engine';
import type { Card, Game, Side } from '../src/gwent/engine';
import { collection, createDuel, deckErrors, opponentFor, presets, readDeck } from '../src/gwent/duel';

const card = (key: string, suffix = ''): Card => ({ ...collection.find(c => c.key === key)!, id: key + suffix });
const fresh = () => { const g = act(createDuel(presets[0].cards, presets[1].cards, () => .3), { type: 'start' }); g.turn = 0; g.players.forEach(p => { p.hand = []; p.board = []; p.deck = []; p.discard = []; }); return g; };
function play(g: Game, key: string, side: Side = 0, target?: string, replacement?: string): Game {
  g.turn = side; const c = card(key); g.players[side].hand.push(c); const next = act(g, { type: 'card', id: c.id, target, replacement }); assert.notEqual(next, g, `${key} action legal`); return next;
}
assert.equal(collection.length, 21);
for (const p of presets) { assert.deepEqual(deckErrors(p.cards), []); assert.notDeepEqual([...opponentFor(p.cards).cards].sort(), [...p.cards].sort()); }
assert.ok(deckErrors([]).length);
assert.ok(deckErrors([...presets[0].cards, 'mentor']).length);
assert.ok(deckErrors(presets[0].cards.map(k => k === 'review' ? 'witness' : k)).length);
assert.ok(deckErrors(presets[0].cards.map(k => k === 'review' ? 'fake' : k)).length);
assert.deepEqual(readDeck('{bad'), presets[0].cards);
assert.deepEqual(readDeck(JSON.stringify(presets[2].cards)), presets[2].cards);
let g = createDuel(presets[0].cards, presets[1].cards, () => .3);
assert.deepEqual(g.players.map(p => [p.hand.length, p.deck.length]), [[10, 6], [10, 6]]);
let swapped = act(g, { type: 'swap', id: g.players[0].hand[0].id });
assert.equal(swapped.swaps, 1);
assert.equal(act(swapped, { type: 'swap', id: swapped.players[0].hand[0].id }), swapped, 'cannot swap same replacement twice');
swapped = act(swapped, { type: 'swap', id: swapped.players[0].hand[1].id });
assert.equal(act(swapped, { type: 'swap', id: swapped.players[0].hand[2].id }), swapped);

// Designated swap: player picks both the outgoing hand card and the incoming spare card.
g = createDuel(presets[0].cards, presets[1].cards, () => .3);
const out = g.players[0].hand[0], pick = g.players[0].deck[2];
let designated = act(g, { type: 'swap', id: out.id, with: pick.id });
assert.notEqual(designated, g, 'designated swap legal');
assert.equal(designated.swaps, 1);
assert.ok(designated.players[0].hand.some(c => c.id === pick.id), 'chosen spare enters hand');
assert.ok(!designated.players[0].hand.some(c => c.id === out.id), 'outgoing card leaves hand');
assert.ok(designated.players[0].deck.some(c => c.id === out.id), 'outgoing card returns to spare');
assert.equal(designated.players[0].hand.length, 10); assert.equal(designated.players[0].deck.length, 6);
assert.equal(act(designated, { type: 'swap', id: pick.id, with: designated.players[0].deck[0].id }), designated, 'swapped-in card cannot be swapped again');
assert.equal(act(designated, { type: 'swap', id: designated.players[0].hand[1].id, with: 'missing-id' }), designated, 'unknown spare id rejected');

for (const amount of [0, 1, 2, 6]) {
  g = fresh(); g.players[0].deck = Array.from({ length: amount }, (_, i) => card('copper', String(i)));
  g = play(g, 'spy'); assert.equal(score(g, 0), 0); assert.equal(score(g, 1), 4);
  assert.equal(g.players[0].hand.length, Math.min(2, amount)); assert.equal(g.players[0].deck.length, Math.max(0, amount - 2));
}
g = fresh(); g = play(g, 'mentor'); g = play(g, 'limewater'); g = play(g, 'carbonate'); g = play(g, 'acid');
assert.equal(score(g, 0), 27); assert.equal(power(g, 0, g.players[0].board[0]), 7);
g = play(g, 'peroxide'); g = play(g, 'catalyst'); g = play(g, 'splint'); assert.equal(score(g, 0), 48, 'mentor only triggers once');
g = fresh(); g = play(g, 'carbonate'); g = play(g, 'acid'); g = play(g, 'limewater'); g = play(g, 'mentor'); assert.equal(score(g, 0), 25, 'no retroactive mentor');
const records = structuredClone(g.experiments);
g = play(g, 'challenge', 1, 'limewater'); assert.equal(score(g, 0), 16, 'challenge pauses every reward in one carbon experiment'); assert.deepEqual(g.experiments, records);
for (const key of ['carbonate', 'acid', 'limewater']) assert.equal(cardState(g, 0, card(key)), '奖励待复核');
assert.equal(reactionBonus(g, 0, card('limewater')), 5, 'the chemical result remains recorded');
g = play(g, 'review', 0, 'carbonate'); assert.equal(score(g, 0), 25, 'review restores the whole disputed record'); assert.deepEqual(g.experiments, records);
g = play(g, 'witness'); g = play(g, 'challenge', 1, 'limewater'); assert.equal(score(g, 0), 30); assert.deepEqual(g.tactics!.witnessUsed, [0]);
// Give the opponent a second distinct challenge solely to test the once-per-round guard.
g.turn = 1; g.players[1].hand.push(card('challenge', '-second')); g = act(g, { type: 'card', id: 'challenge-second', target: 'limewater' }); assert.equal(score(g, 0), 21, 'witness blocks one whole record, not a single card');
assert.deepEqual(skillTargets(g, 0, card('relay')), [], 'reacted materials, catalyst, heroes cannot be recalled');

g = fresh(); g = play(g, 'copper'); g = play(g, 'measure', 0, 'copper'); assert.equal(score(g, 0), 10);
assert.deepEqual(skillTargets(g, 0, card('measure')), [], 'no repeated measure'); assert.deepEqual(skillTargets(g, 0, card('relay')), [], 'cannot recall boosted card');
g = fresh(); g = play(g, 'limewater'); g.players[0].hand.push(card('carbonate'));
g = play(g, 'relay', 0, 'limewater', 'carbonate'); assert.equal(score(g, 0), 4); assert.equal(g.players[0].hand[0].key, 'limewater'); assert.equal(g.players[0].discard[0].key, 'relay');
g.players[0].hand.push(card('challenge')); g.turn = 0; assert.equal(act(g, { type: 'card', id: 'challenge', target: 'carbonate' }), g, 'invalid opposing target is rejected without mutation');
g = fresh(); g = play(g, 'peroxide'); g = play(g, 'catalyst'); assert.ok(!skillTargets(g, 0, card('relay')).some(c => c.key === 'catalyst'));

g = fresh(); g = play(g, 'copper'); g = play(g, 'measure', 0, 'copper');
g.turn = 0; g = act(g, { type: 'pass' }); g = act(g, { type: 'pass' }); const hand = g.players[0].hand.length, reserve = g.players[0].deck.length;
g = act(g, { type: 'next' }); assert.deepEqual(g.tactics!.boosts, {}); assert.equal(g.players[0].hand.length, hand); assert.equal(g.players[0].deck.length, reserve);

let seed = 517; const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
for (let n = 0; n < 200; n++) {
  g = act(createDuel(presets[n % 3].cards, presets[(n + 1) % 3].cards, random), { type: 'start' });
  let turns = 0;
  while (g.phase !== 'over' && turns++ < 150) {
    const next = act(g, g.phase === 'round' ? { type: 'next' } : chooseAI(g)); assert.notEqual(next, g, 'AI always chooses legal action'); g = next;
    const all = g.players.flatMap(p => [...p.hand, ...p.board, ...p.deck, ...p.discard]); assert.equal(all.length, 32); assert.equal(new Set(all.map(c => c.id)).size, 32);
    assert.ok(g.players.every((_, side) => score(g, side as Side) >= 0));
  }
  assert.equal(g.phase, 'over'); assert.ok(g.round <= 3);
}
g = act(createDuel(presets[0].cards, presets[1].cards, random), { type: 'start' }); g.turn = 1;
const chosen = chooseAI(g); g.players[0].hand = g.players[0].hand.map((c, i) => ({ ...card('silica', String(i)), power: 999 }));
assert.deepEqual(chooseAI(g), chosen, 'AI never inspects opponent hidden card values');
assert.ok(cardActions(g, 1, g.players[1].hand[0]).length >= 0);

// Easy AI: no strategic round concession, picks among top-3 actions, always legal.
g = fresh(); g.players[0].board = [card('copper', 'a'), card('copper', 'b'), card('copper', 'c')];
g.players[1].hand = [card('iron', 'x')]; g.players[1].lives = 2; g.turn = 1;
assert.deepEqual(chooseAI(g), { type: 'pass' }, 'normal AI concedes a far-behind round');
assert.equal(chooseAI(g, { level: 'easy', random: () => 0 }).type, 'card', 'easy AI keeps playing instead of conceding');
for (const r of [0, .37, .99]) { const a = chooseAI(g, { level: 'easy', random: () => r }); assert.notEqual(act(g, a), g, 'easy AI action always legal'); }
for (let n = 0; n < 20; n++) {
  let eg = act(createDuel(presets[n % 3].cards, presets[(n + 1) % 3].cards, random), { type: 'start' });
  let turns = 0;
  while (eg.phase !== 'over' && turns++ < 150) { const next = act(eg, eg.phase === 'round' ? { type: 'next' } : chooseAI(eg, { level: 'easy', random })); assert.notEqual(next, eg, 'easy AI finishes matches'); eg = next; }
  assert.equal(eg.phase, 'over'); assert.ok(eg.round <= 3);
}
console.log('PASS: deck validation/persistence recovery, mulligan, spy 0/1/2 draws, both heroes, challenge/review, relay restrictions, round cleanup, 200 full constructed matches, hidden-hand independence, easy-AI behavior and 20 easy matches.');

// Hydrogen chain: metal + acid -> H2, tested by flame (lit splint); either metal qualifies.
g = fresh(); g = play(g, 'iron'); g = play(g, 'acid');
assert.equal(g.experiments![0].length, 1); assert.equal(g.experiments![0][0].kind, 'hydrogen');
assert.equal(score(g, 0), 16, 'metal+acid production: 4+4 plus 4+4 bonus');
g = play(g, 'flame'); assert.ok(g.experiments![0][0].testedBy, 'flame tests hydrogen');
assert.equal(score(g, 0), 23, 'tested hydrogen: 16 + flame 2 + relay 5');
g = fresh(); g = play(g, 'magnesium'); g = play(g, 'acid'); assert.equal(g.experiments![0][0].kind, 'hydrogen', 'magnesium also works as the metal');
g = fresh(); g = play(g, 'iron'); g = play(g, 'acid'); g = play(g, 'splint'); assert.equal(g.experiments![0][0].testedBy, undefined, 'glowing splint cannot test hydrogen');
g = fresh(); g = play(g, 'carbonate'); g = play(g, 'acid'); g = play(g, 'iron');
assert.equal(g.experiments![0].length, 1); assert.equal(g.experiments![0][0].kind, 'carbon', 'consumed acid cannot start a second chain');
g = fresh(); g = play(g, 'peroxide'); g = play(g, 'catalyst'); g = play(g, 'flame'); assert.equal(g.experiments![0][0].testedBy, undefined, 'flame cannot test oxygen');
assert.ok(comboInfo('metal')[0].includes('H₂')); assert.ok(comboInfo('flame')[0].includes('+5')); assert.deepEqual(comboInfo('copper'), []);
console.log('PASS: hydrogen chain (both metals, flame test, wrong testers rejected, acid exclusivity, combo info).');
