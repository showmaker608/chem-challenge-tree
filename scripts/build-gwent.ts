import { build } from 'vite';
import { cp, mkdir, rename } from 'node:fs/promises';
import { resolve } from 'node:path';

// A separate entry publishes only the card game, not unrelated site changes.
const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'dist-game');
await build({
  root,
  base: '/games/chem-gwent/',
  build: {
    outDir: out,
    copyPublicDir: false,
    rolldownOptions: { input: resolve(root, 'game/index.html') },
  },
});
await rename(resolve(out, 'game/index.html'), resolve(out, 'index.html'));
await mkdir(resolve(out, 'gwent'), { recursive: true });
await cp(resolve(root, 'public/gwent'), resolve(out, 'gwent'), { recursive: true });
