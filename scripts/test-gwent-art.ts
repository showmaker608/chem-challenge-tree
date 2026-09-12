import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { cardPortrait } from '../src/gwent/artwork';
import { createLesson } from '../src/gwent/onboarding';
import type { Lesson } from '../src/gwent/onboarding';
import { collection } from '../src/gwent/duel';

const distinct = new Set<string>();
for (const lesson of ['first', 'bond', 'reaction', 'practice'] as Lesson[]) {
  for (const player of createLesson(lesson).players) {
    for (const card of player.hand) {
      const path = cardPortrait(card);
      assert.ok(path, `${card.name} has a portrait mapping`);
      assert.ok(existsSync(`public${path}`), `${card.name} WebP exists`);
      assert.ok(existsSync(`public${path.replace('.webp', '.png')}`), `${card.name} source preserved`);
      distinct.add(path);
    }
  }
}
assert.equal(distinct.size, 10, 'All ten card identities have distinct portraits');
assert.equal(cardPortrait({ symbol: 'unknown' }), undefined, 'Unknown cards must not show another material');
for (const card of collection.filter(c => c.ability !== 'tactic')) {
  const path = cardPortrait(card); assert.ok(path, `${card.name} portrait mapped`);
  assert.ok(existsSync(`public${path}`), `${card.name} delivery exists`);
  assert.ok(existsSync(`public${path.replace('.webp', '.png')}`), `${card.name} source preserved`);
  distinct.add(path);
}
assert.equal(distinct.size, 16, 'Thirteen materials plus three distinct role portraits');
console.log('PASS: sixteen distinct portraits; all lessons and constructed roles mapped; original assets preserved.');
