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
const {cardState} = await import('../src/gwent/engine');
for (const kind of ['carbon','oxygen'] as const) {
 for(const reverse of [false,true]){
  let r=createLesson('practice'); r.players[1].passed=true;
  const names=kind==='carbon'?['carbonate','acid','limewater']:['peroxide','catalyst','splint'];
  const parts=names.map(name=>r.players[0].hand.find(c=>c.chemical===name)!);
  for(const c of reverse?[parts[1],parts[0]]:[parts[0],parts[1]]) r=act(r,{type:'card',id:c.id});
  assert.equal(score(r,0),kind==='carbon'?12:14);
  assert.equal(r.experiments![0].length,1);
  assert.equal(cardState(r,0,parts[0]),'已反应');
  if(kind==='oxygen')assert.equal(cardState(r,0,parts[1]),'催化剂 · 未消耗');
  r=act(r,{type:'card',id:parts[2].id});
  assert.equal(score(r,0),kind==='carbon'?20:21);
  assert.equal(r.experiments![0][0].testedBy,parts[2].id);
  const duplicate={...parts[2],id:'duplicate'};r.players[0].hand.push(duplicate);
  const before=score(r,0);r=act(r,{type:'card',id:duplicate.id});assert.equal(score(r,0),before+duplicate.power);
  const hand=r.players[0].hand.length;r=act(r,{type:'pass'});r=act(r,{type:'next'});
  assert.deepEqual(r.experiments,[[],[]]);assert.equal(score(r,0),0);assert.equal(r.players[0].hand.length,hand);
 }
}
let early=createLesson('bond');early.players[1].passed=true;
for(const chemical of ['limewater','carbonate','acid']){
 const c=early.players[0].hand.find(c=>c.chemical===chemical)!;early=act(early,{type:'card',id:c.id});
}
assert.equal(score(early,0),20);assert.ok(early.experiments![0][0].testedBy,'Prepared limewater must inspect the later product');
for (const kind of ['carbon', 'oxygen'] as const) {
 for (const order of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]) {
  let r=createLesson('practice');r.players[1].passed=true;
  const names=kind==='carbon'?['carbonate','acid','limewater']:['peroxide','catalyst','splint'];
  const parts=names.map(name=>r.players[0].hand.find(c=>c.chemical===name)!);
  for(const i of order)r=act(r,{type:'card',id:parts[i].id});
  assert.equal(score(r,0),kind==='carbon'?20:21);
  assert.equal(r.experiments![0][0].testedBy,parts[2].id);
  assert.equal(r.experiments![1].length,0,'No cross-side reactions');
 }
}
for(const lesson of ['first','bond','reaction','practice'] as const){
 let r=createLesson(lesson);assert.ok(r.players.flatMap(p=>p.hand).every(c=>c.ability==='unit'));
 for(let i=0;i<100&&r.phase!=='over';i++){
  if(r.phase==='round'){r=act(r,{type:'next'});continue;}
  const p=r.players[0];
  r=act(r,r.turn===1?easyAI(r,lesson):!p.hand.length||(r.players[1].passed&&score(r,0)>score(r,1))?{type:'pass'}:{type:'card',id:p.hand[0].id});
 }
 assert.equal(r.phase,'over');
}
console.log('PASS: all six orders for both chains, prepared inspection, catalyst retained, no repeated inspection, round cleanup, all lessons complete.');
