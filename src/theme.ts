// 固定亮色主题 CSS 通过 JS 注入，绕过 Tailwind 4 的编译清除
const THEME_CSS = `
:root {
  --accent: #0f766e;
  --accent-soft: #7dd3c7;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;

  --bg-page-start: #edf5ef;
  --bg-page-mid: #f4f1e7;
  --bg-page-end: #e8f1ea;
  --bg-card: #fbfaf3;
  --bg-card-bright: #fffdf7;
  --bg-panel: rgba(251, 250, 243, 0.72);
  --bg-disabled: #dbe8df;
  --bg-highlight: #e1f3ed;
  --bg-green-light: #edf8ed;
  --bg-amber: #fff7df;
  --bg-amber-dark: #fff1c7;
  --bg-orange: #ffe2c2;
  --bg-quiz: #f6f3e8;
  --bg-tag: #e7eee8;

  --text-main: #17313a;
  --text-muted: #4f6d67;
  --text-disabled: #a8c7bd;
  --text-amber: #92400e;

  --border-color: #d8e6dc;
  --border-amber: #ead79a;
  --shadow-color: rgba(20, 83, 45, 0.08);
  --shadow-strong: rgba(20, 83, 45, 0.14);

  --teal-glow: rgba(125, 211, 199, 0.18);
  --nav-bg: rgba(251, 250, 243, 0.95);
  --scrollbar-track: #e8f0e8;
  --scrollbar-thumb: #a8c7bd;
}

body {
  background: radial-gradient(circle at 20% 0%, rgba(125, 211, 199, 0.18), transparent 32rem), linear-gradient(180deg, var(--bg-page-start) 0%, var(--bg-page-mid) 100%);
  color: var(--text-main);
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--scrollbar-track); }
::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 3px; }

.soft-panel {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.36), rgba(255,255,255,0.04)),
    var(--bg-panel);
  border: 1px solid var(--border-color);
  box-shadow: 0 16px 38px var(--shadow-color);
  backdrop-filter: blur(18px);
}

.soft-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 24px var(--shadow-color);
}

.soft-card:hover {
  box-shadow: 0 16px 34px var(--shadow-strong);
}

.tiny-lab-dot {
  background-image: radial-gradient(circle, rgba(15, 118, 110, 0.18) 1px, transparent 1px);
  background-size: 18px 18px;
}
`;

document.documentElement.removeAttribute('data-theme');
try {
  localStorage.removeItem('chem-tree-theme');
} catch {
  // Theme cleanup is best-effort.
}

const styleEl = document.createElement('style');
styleEl.textContent = THEME_CSS;
document.head.prepend(styleEl);
