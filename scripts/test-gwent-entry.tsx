import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChemGwent } from '../src/components/ChemGwent';
import { createQuickMatch, quickHint } from '../src/gwent/entry';
import { presets } from '../src/gwent/duel';
import { act } from '../src/gwent/engine';

const initial = createQuickMatch(presets[0].cards, false);
assert.equal(initial.phase, 'play', 'New players enter a match without deck-building or mulligan');
assert.equal(initial.turn, 0);
assert.equal(initial.players[0].hand.length, 10);
assert.ok(initial.players[0].hand.some(c => c.chemical === 'carbonate'));
assert.match(quickHint(initial)!, /先选一张/);
const before = structuredClone(initial);
let playing = act(initial, {type:'card', id:initial.players[0].hand.find(c => c.chemical === 'carbonate')!.id});
assert.deepEqual(initial, before, 'Creating hints and playing never mutate the input state');
assert.equal(quickHint(playing), null, 'No distracting hint during opponent turn');
playing.turn = 0;
assert.match(quickHint(playing)!, /稀盐酸/);
playing = act(playing, {type:'card', id:playing.players[0].hand.find(c => c.chemical === 'acid')!.id});
playing.turn = 0;
assert.match(quickHint(playing)!, /如何检验/);
playing = act(playing, {type:'card', id:playing.players[0].hand.find(c => c.chemical === 'limewater')!.id});
playing.turn = 0;
assert.match(quickHint(playing)!, /接力完成/);
playing.players[1].passed = true;
assert.match(quickHint(playing)!, /对手已收手/);
playing.phase = 'over';
assert.equal(quickHint(playing), null);

for (const preset of presets) {
  const match = createQuickMatch(preset.cards, true);
  assert.equal(match.duel, true);
  assert.equal(match.phase, 'mulligan');
  assert.equal(match.players[0].hand.length, 10);
  assert.equal(match.players[0].deck.length, 6);
  assert.deepEqual([...match.players[0].hand, ...match.players[0].deck].map(c => c.key).sort(), [...preset.cards].sort());
}
const home = renderToStaticMarkup(<ChemGwent onBack={() => {}} />);
assert.equal((home.match(/开始对决/g) || []).length, 1);
assert.ok(home.includes('我的牌组'));
assert.ok(home.includes('aria-label="帮助"'));
assert.ok(home.includes('aria-label="声音设置"'));
for (const obsolete of ['开始新手教学', '播放 BGM', '直接试玩', '1 出牌与留牌', '组建牌组 · 自由对战']) assert.ok(!home.includes(obsolete), `${obsolete} is not on the homepage`);
console.log('PASS: two-action homepage, first-time direct entry, returning custom decks and contextual reaction/inspection/pass hints.');
