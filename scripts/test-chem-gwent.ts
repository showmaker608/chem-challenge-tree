import { strict as assert } from 'node:assert';
import { act, chooseAI, createGame, deck, power, score } from '../src/gwent/engine';
import type { Game } from '../src/gwent/engine';
const fresh = (): Game => { const g = createGame(() => .4); g.phase = 'play'; g.turn = 0; g.players.forEach(p => { p.board = []; p.hand = []; }); return g; };
const cards = deck('test');
assert.equal(cards.filter(c => c.power > 0).length, 22);
let g = createGame(() => .4); assert.equal(g.players[0].hand.length, 10);
const id = g.players[0].hand[0].id; g = act(g, { type: 'swap', id }); assert.equal(g.swaps, 1); assert.equal(new Set([...g.players[0].hand, ...g.players[0].deck].map(c => c.id)).size, 29);
g = fresh(); g.players[0].board = cards.filter(c => c.name === '铁'); g.weather = [0]; g.players[0].horns = [0]; assert.equal(score(g, 0), 18);
const hero = cards.find(c => c.ability === 'hero')!; g.players[0].board.push(hero); g.weather.push(2); g.players[0].horns.push(2); assert.equal(power(g, 0, hero), 10);
g = fresh(); const spy = cards.find(c => c.ability === 'spy')!; g.players[0].hand = [spy]; const before = g.players[0].deck.length; g = act(g, { type: 'card', id: spy.id }); assert.equal(g.players[1].board[0].id, spy.id); assert.equal(g.players[0].hand.length, 2); assert.equal(g.players[0].deck.length, before - 2);
g = fresh(); g = act(g, { type: 'pass' }); assert.equal(g.turn, 1); g = act(g, { type: 'pass' }); assert.equal(g.phase, 'round'); assert.deepEqual(g.players.map(p => p.lives), [1, 1]); g = act(g, { type: 'next' }); g = act(g, { type: 'pass' }); g = act(g, { type: 'pass' }); assert.equal(g.phase, 'over'); assert.equal(g.result, '平局');
g = fresh(); g.players[0].board = [cards.find(c => c.name === '铜')!, hero]; g.players[1].board = [cards.find(c => c.name === '二氧化硅')!]; const scorch = cards.find(c => c.ability === 'scorch')!; g.players[0].hand = [scorch]; g = act(g, { type: 'card', id: scorch.id }); assert.deepEqual(g.players.map(p => p.board.length), [1, 0]); assert.equal(g.players[0].board[0].ability, 'hero');
g = fresh(); g.starter = 1; g.players[0].board = [hero]; g = act(g, { type: 'pass' }); g = act(g, { type: 'pass' }); g = act(g, { type: 'next' }); assert.equal(g.turn, 0);
for (let match = 0; match < 100; match++) { g = act(createGame(), { type: 'start' }); let turns = 0; while (g.phase !== 'over' && turns++ < 180) { if (g.phase === 'round') { const sizes = g.players.map(p => p.hand.length); g = act(g, { type: 'next' }); assert.deepEqual(g.players.map(p => p.hand.length), sizes); } else g = act(g, chooseAI(g)); } assert.equal(g.phase, 'over'); assert.ok(g.round <= 3); }
console.log('PASS: deck, redraw, weather/bond/horn, hero, spy, scorch, tied gems, no round draw; 100 complete AI matches.');

const { createLesson, easyAI } = await import('../src/gwent/onboarding');
for (const lesson of ['first', 'bond', 'practice'] as const) {
  let lessonGame = createLesson(lesson);
  assert.ok(lessonGame.players.every(p => !p.leader && p.hand.length === 10));
  assert.ok(lessonGame.players.flatMap(p => [...p.hand, ...p.deck]).every(c => c.ability === 'unit' || (lesson !== 'first' && c.ability === 'bond')));
  let turns = 0;
  while (lessonGame.phase !== 'over' && turns++ < 120) {
    if (lessonGame.phase === 'round') { lessonGame = act(lessonGame, { type: 'next' }); continue; }
    if (lessonGame.turn === 1) lessonGame = act(lessonGame, easyAI(lessonGame, lesson));
    else { const p = lessonGame.players[0]; const stop = !p.hand.length || (lessonGame.players[1].passed && score(lessonGame, 0) > score(lessonGame, 1)); lessonGame = act(lessonGame, stop ? { type: 'pass' } : { type: 'card', id: p.hand[0].id }); }
  }
  assert.equal(lessonGame.phase, 'over'); if (lesson !== 'practice') assert.ok(lessonGame.players[0].lives > 0, 'Simple tutorial strategy should win');
}
let tutorial = createLesson('bond');
const pair = tutorial.players[0].hand.filter(c => c.ability === 'bond');
tutorial = act(tutorial, { type: 'card', id: pair[0].id });
tutorial = act(tutorial, { type: 'pass' });
tutorial = act(tutorial, { type: 'card', id: pair[1].id });
assert.equal(score(tutorial, 0), 16);
assert.equal(power(tutorial, 0, pair[0]), 8);
console.log('PASS: gradual decks, no leaders/specials, winnable lessons, 4 × 2 = 8 per card.');
for (const reverse of [false, true]) {
  let r = createLesson('reaction');
  const pair = r.players[0].hand.filter(c => c.reagent);
  if (reverse) pair.reverse();
  r = act(r, { type: 'card', id: pair[0].id });
  assert.equal(score(r, 0), pair[0].power);
  r = act(r, { type: 'pass' });
  r = act(r, { type: 'card', id: pair[1].id });
  assert.equal(score(r, 0), 14);
  assert.equal(r.players[0].board.length, 2, 'Catalyst stays on board');
  const duplicate = { ...pair[1], id: 'duplicate' };
  r.players[0].hand.push(duplicate);
  r = act(r, { type: 'card', id: duplicate.id });
  assert.equal(score(r, 0), 14 + duplicate.power, 'No repeated bonus');
  r = act(r, { type: 'pass' });
  r = act(r, { type: 'next' });
  assert.equal(score(r, 0), 0);
}
let isolated = createLesson('reaction');
const reagents = isolated.players[0].hand.filter(c => c.reagent);
isolated.players[0].board = [reagents[0]];
isolated.players[1].board = [reagents[1]];
assert.equal(score(isolated, 0), 4, 'Opposing sides cannot combine');
isolated.players[0].board.push({ ...reagents[1], row: 1 });
assert.equal(score(isolated, 0), 6, 'Different rows cannot combine');
console.log('PASS: reaction pair both orders, catalyst retained, no duplicate reward, round reset, side/row isolation.');
