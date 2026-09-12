import assert from 'node:assert/strict';
import { act, freshTactics } from '../src/gwent/engine';
import type { Card, Game } from '../src/gwent/engine';
import { collection, createDuel, presets } from '../src/gwent/duel';
import { keyRoundEvent, matchEvent } from '../src/gwent/matchEvents';

const card = (key: string, id: string): Card => ({ ...collection.find(item => item.key === key)!, id });
function game(): Game {
  const state = createDuel(presets[0].cards, presets[1].cards, () => .1);
  state.phase = 'play'; state.turn = 0; state.tactics = freshTactics(); state.experiments = [[], []];
  state.players[0].hand = []; state.players[1].hand = []; state.players.forEach(player => { player.board = []; player.discard = []; player.passed = false; });
  return state;
}
function play(state: Game, c: Card, target?: string) { state.players[0].hand = [c]; state.turn = 0; const next = act(state, { type: 'card', id: c.id, target }); return { next, event: matchEvent(state, next, { type: 'card', id: c.id, target })! }; }

let state = game();
let move = play(state, card('copper', 'copper-1'));
assert.match(move.event.title, /打出「铜丝」/);

state = game(); state.players[0].board = [card('carbonate', 'carbonate-1')];
move = play(state, card('acid', 'acid-1'));
assert.match(move.event.title, /完成制气/);
move.next.turn = 0; move.next.players[0].hand = [card('limewater', 'limewater-1')];
const inspected = act(move.next, { type: 'card', id: 'limewater-1' });
assert.match(matchEvent(move.next, inspected, { type: 'card', id: 'limewater-1' })!.title, /完成CO₂检验/);

state = game(); state.players[1].board = [card('carbonate', 'enemy-carbonate')]; state.experiments![1] = [{ id: 'enemy-carbon', kind: 'carbon', cards: ['enemy-carbonate'], product: 'CO₂' }];
move = play(state, card('challenge', 'challenge-1'), 'enemy-carbonate');
assert.match(move.event.title, /成果质疑/);

state = game(); state.players[1].board = [card('carbonate', 'enemy-carbonate'), card('witness', 'witness-1')]; state.experiments![1] = [{ id: 'enemy-carbon', kind: 'carbon', cards: ['enemy-carbonate'], product: 'CO₂' }];
move = play(state, card('challenge', 'challenge-2'), 'enemy-carbonate');
assert.equal(move.event.emphasis, 'protect');

state = game(); state.players[0].board = [card('carbonate', 'own-carbonate')]; state.tactics!.disputed = ['own-carbonate'];
move = play(state, card('review', 'review-1'), 'own-carbonate');
assert.match(move.event.title, /实验复核/);

state = game(); state.players[0].hand = [card('copper', 'kept-card')]; state.turn = 0;
const passed = act(state, { type: 'pass' });
const passEvent = matchEvent(state, passed, { type: 'pass' })!;
assert.match(passEvent.detail, /保留 1 张手牌/);
assert.equal(keyRoundEvent([move.event, passEvent])?.id, move.event.id);
console.log('PASS: visible events cover ordinary play, reaction, inspection, challenge, protection, review, pass, and factual recap selection.');
