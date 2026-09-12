import { useEffect, useRef, useState } from 'react';
import { act, power, rows, score, reactionPair, reactionBonus } from '../gwent/engine';
import type { Action, Card, Game, Side } from '../gwent/engine';
import { createLesson, easyAI, guide, lessonNames } from '../gwent/onboarding';
import type { Lesson } from '../gwent/onboarding';
import { TableAudio } from '../gwent/audio';
import './ChemGwent.css';
function preferences() { try { return JSON.parse(localStorage.getItem('chem-gwent-audio') || '{}'); } catch { return {}; } }
export function ChemGwent({ onBack }: { onBack: () => void }) {
  const [lesson, setLesson] = useState<Lesson>('first');
  const [game, setGame] = useState<Game>(() => createLesson('first'));
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [inspect, setInspect] = useState<Card | null>(null);
  const [rules, setRules] = useState(false);
  const [confirmPass, setConfirmPass] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [notice, setNotice] = useState('');
  const [musicOn, setMusicOn] = useState<boolean>(() => preferences().music !== false);
  const [fxOn, setFxOn] = useState<boolean>(() => preferences().fx !== false);
  const [volume, setVolume] = useState<number>(() => { const v = preferences().volume; return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : .55; });
  const [audioError, setAudioError] = useState(false);
  const audio = useRef<TableAudio | null>(null);
  useEffect(() => { const player = new TableAudio(); audio.current = player; return () => { player.dispose(); audio.current = null; }; }, []);
  useEffect(() => { audio.current?.settings(musicOn, fxOn, volume); try { localStorage.setItem('chem-gwent-audio', JSON.stringify({ music: musicOn, fx: fxOn, volume })); } catch { /* Private browsing may deny storage. */ } }, [musicOn, fxOn, volume]);
  useEffect(() => { const hide = () => { if (document.hidden) void audio.current?.pause(); else if (started) void audio.current?.start(musicOn, fxOn, volume).catch(() => setAudioError(true)); }; document.addEventListener('visibilitychange', hide); return () => document.removeEventListener('visibilitychange', hide); }, [started, musicOn, fxOn, volume]);
  function soundStart() { void audio.current?.start(musicOn, fxOn, volume).then(() => setAudioError(false)).catch(() => setAudioError(true)); }
  const card = game.players[0].hand.find(c => c.id === selected);
  const canPlay = started && game.phase === 'play' && game.turn === 0 && !game.players[0].passed;
  function describe(before: Game, next: Game, action: Action): string {
    const who = before.turn === 0 ? '你' : '电脑';
    if (action.type === 'pass') return `${who}本局不再出牌，保留剩余手牌。`;
    if (action.type !== 'card') return '';
    const c = before.players[before.turn].hand.find(x => x.id === action.id)!;
    if (reactionPair(next, before.turn).length && !reactionPair(before, before.turn).length) return `${who}触发催化组合：两张牌各 +4，共 +8 游戏奖励。二氧化锰加快过氧化氢分解，自身不被消耗。`;
    const count = next.players[before.turn].board.filter(x => x.name === c.name).length;
    return `${who}打出「${c.name}」：${c.ability === 'bond' && count > 1 ? `${count} 张同名组合，每张 ${c.power} × ${count} = ${power(next, before.turn, c)} 分。` : `${c.power} 分。`}总分 ${score(before, before.turn)} → ${score(next, before.turn)}。`;
  }
  function dispatch(action: Action) { const next = act(game, action); if (next === game) return; setGame(next); setNotice(describe(game, next, action)); setSelected(null); setConfirmPass(false); audio.current?.effect(next.phase === 'round' || next.phase === 'over' ? 'round' : 'play'); }
  useEffect(() => {
    if (!started || game.phase !== 'play' || game.turn !== 1) return;
    const timer = window.setTimeout(() => { const action = easyAI(game, lesson); const next = act(game, action); setGame(next); setNotice(describe(game, next, action)); audio.current?.effect(next.phase === 'round' || next.phase === 'over' ? 'round' : 'play'); }, 1500);
    return () => window.clearTimeout(timer);
  }, [game, started, lesson]);
  function begin(next: Lesson) { setLesson(next); setGame(createLesson(next)); setSelected(null); setInspect(null); setNotice('你先手。点击手牌，再点出牌。'); setStarted(true); setConfirmPass(false); soundStart(); }
  const preview = card && canPlay ? act(game, { type: 'card', id: card.id }) : null;
  function tile(c: Card, side?: Side) {
    const value = side === undefined ? c.power : power(game, side, c);
    const count = side === undefined ? 1 : game.players[side].board.filter(x => x.name === c.name).length;
    return <button key={c.id} className={`cg-card ${selected === c.id ? 'selected' : ''} ${value > c.power ? 'boosted' : ''} ${card?.reagent && c.reagent && card.reagent !== c.reagent && (side === 0 || side === undefined) ? 'cg-partner' : ''}`} onClick={() => { setInspect(c); if (side === undefined) setSelected(c.id); audio.current?.effect('select'); }} aria-pressed={side === undefined ? selected === c.id : undefined} aria-label={`${c.name} ${value}分${c.ability === 'bond' ? ' 同名组合' : ''}`}><span className="cg-power">{value}</span><span className="cg-symbol">{c.symbol}</span><strong>{c.name}</strong><small>{c.reagent === 'catalyst' ? '催化搭档' : c.reagent === 'peroxide' ? '反应搭档' : c.ability === 'bond' ? '同名组合' : '普通牌'}</small>{side !== undefined && reactionBonus(game, side, c) > 0 && <span className="cg-equation">{c.power} + 4 组合</span>}{c.ability === 'bond' && count > 1 && <span className="cg-equation">{c.power} × {count} = {value}</span>}</button>;
  }
  function board(side: Side) { const p = game.players[side]; return <section className={`cg-side side-${side}`} aria-label={side === 0 ? '你的战场' : '电脑战场'}><div className="cg-player"><strong>{side === 0 ? '你' : '练习伙伴 · 简单电脑'}</strong><span className="cg-gems" aria-label={`剩余 ${p.lives} 颗宝石`}>{'◆'.repeat(p.lives)}{'◇'.repeat(2 - p.lives)}</span><small>剩余手牌 {p.hand.length} {p.passed ? ' · 已停牌' : ''}</small><b className="cg-total" key={score(game, side)}>{score(game, side)}</b></div>{([0, 1, 2] as const).map(r => <div key={r} className={`cg-row ${side === 0 && canPlay && card?.row === r ? 'cg-row-ready' : ''}`}><div className="cg-row-label"><span>{rows[r]}</span><b>{score(game, side, r)}</b></div><div className="cg-units">{p.board.filter(c => c.row === r).map(c => tile(c, side))}{!p.board.some(c => c.row === r) && <span className="cg-empty">{side === 0 && card?.row === r ? '选中的牌将放在这里' : '暂无卡牌'}</span>}</div></div>)}</section>; }
  return <main className="cg cg-beginner"><div className="cg-shell"><header className="cg-header"><button onClick={() => started && game.phase !== 'over' ? setConfirmExit(true) : onBack()}>← 返回</button><div><small>CHEMISTRY · PLAY & LEARN</small><h1>化学对决</h1></div><button onClick={() => setRules(!rules)}>怎么玩</button></header>
    <div className="cg-audio"><button aria-pressed={musicOn} onClick={() => { setMusicOn(!musicOn); void audio.current?.start(!musicOn, fxOn, volume).catch(() => setAudioError(true)); }}>♫ 音乐{musicOn ? '开' : '关'}</button><label>音量 <input aria-label="音乐音量" type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(Number(e.target.value))} /></label><button aria-pressed={fxOn} onClick={() => setFxOn(!fxOn)}>音效{fxOn ? '开' : '关'}</button>{audioError && <button onClick={soundStart}>点击重试播放音乐</button>}</div>
    {rules && <section className="cg-rules"><h2>先记住三件事</h2><p>① 每人轮流出一张牌，三排加起来的总分决定本局胜负。<br />② 点“本局不再出牌”后本局不能再行动，手牌留给下一局。<br />③ 输一局失去一颗宝石，失去两颗则整场结束；平分双方都失去一颗。</p><p>开局 10 张牌，局间清场、不补牌。上局胜者先手，平局交换先手。同名组合在第 2 课才加入；领袖与特殊牌暂不开放。三个区域是化学观察角度，没有高低等级。</p></section>}
    {!started ? <section className="cg-welcome"><span className="cg-kicker">从一张牌开始</span><h2>会比大小，<br />就能开始第一局。</h2><p>轮流出牌，比总分。记得把一些牌留到下一局。</p><div className="cg-steps"><span>1 出牌与留牌</span><span>2 同名组合</span><span>3 催化组合</span><span>4 轻松对战</span></div><button className="primary" onClick={() => begin('first')}>开始新手教学{musicOn ? ' · 播放 BGM' : ''}</button><button onClick={() => begin('reaction')}>直接试玩：催化组合</button><button onClick={() => begin('practice')}>我会玩了，直接轻松对战</button><p className="cg-subtle">教学采用固定手牌，电脑会少量出牌，给你时间看懂。音乐可随时关闭。</p></section> : <>
      <section className="cg-coach"><small>{lessonNames[lesson]} · 第 {game.round} 局</small><p>{guide(game, lesson)}</p></section>
      <div className="cg-layout"><div className="cg-table">{board(1)}<div className="cg-divider"><strong aria-live="polite">{game.phase !== 'play' ? game.result : game.turn === 0 ? '轮到你了' : '电脑准备出牌…'}</strong><span>你 {score(game, 0)} : {score(game, 1)} 电脑</span></div>{board(0)}</div><aside className="cg-aside"><div className="cg-detail">{inspect ? <><h2>{inspect.name}</h2><p>{inspect.reagent ? '同排配齐过氧化氢溶液与二氧化锰，两张各 +4 游戏奖励；每侧每局仅一组，不叠加。' : inspect.ability === 'bond' ? '同排同名牌越多，每张分数越高。2 张时每张 ×2，3 张时每张 ×3。' : `普通牌：提供 ${inspect.power} 分，没有隐藏技能。`}</p><small>{rows[inspect.row]}</small><p>{inspect.fact}</p></> : <p>点击牌查看说明；出牌前会显示预计加分。</p>}</div><details className="cg-history"><summary>查看对局记录</summary>{game.log.map((l,i) => <p key={i}>{l}</p>)}</details></aside></div>
      {([0, 1] as const).map(side => reactionPair(game, side).length > 0 && <section key={`${game.round}-${side}`} className="cg-reaction" aria-label={`${side === 0 ? '你' : '电脑'}的催化组合`}><div className="cg-bubbles" aria-hidden="true"><i /><i /><i /><i /></div><strong>{side === 0 ? '你' : '电脑'}：过氧化氢溶液 ━ 二氧化锰</strong><p>催化组合 · (4 + 4) + (2 + 4) = 14 分</p><p>过氧化氢分解加快，生成水和氧气；二氧化锰作催化剂，不被消耗。</p><small>每侧每局一组，各 +4 是游戏奖励，不表示生成物增多或反应速度翻倍。</small></section>)}
      <div className="cg-event" role="status" key={notice}>{notice || '下一局开始，剩余手牌继续使用。'}</div>
      {(game.phase === 'round' || game.phase === 'over') && <section className="cg-result"><h2>{game.result}</h2><p>本局总分：你 {score(game, 0)} · 电脑 {score(game, 1)}</p><p>{game.phase === 'round' ? `你还剩 ${game.players[0].hand.length} 张牌，将全部保留到下一局。` : '输赢都可以重练。接下来每次只多学一个机制。'}</p>{game.phase === 'round' ? <button className="primary" onClick={() => dispatch({ type: 'next' })}>下一局 · 保留手牌</button> : <><button onClick={() => begin(lesson)}>再练一次</button><button className="primary" onClick={() => begin(lesson === 'first' ? 'bond' : lesson === 'bond' ? 'reaction' : 'practice')}>{lesson === 'first' ? '下一课：为什么会翻倍？' : lesson === 'bond' ? '下一课：催化组合' : '开始轻松对战'}</button></>}</section>}
      <section className="cg-hand"><div className="cg-hand-head"><strong>你的手牌 · {game.players[0].hand.length}</strong><small>左右滑动查看 · 点击选牌</small></div><div className="cg-hand-cards">{game.players[0].hand.map(c => tile(c))}{!game.players[0].hand.length && <p>没有手牌了，点“本局不再出牌”进入结算。</p>}</div></section>
      {game.phase === 'play' && <div className="cg-actions"><div className="cg-preview">{card && preview ? <><strong>{card.name} → {rows[card.row]}</strong><span>总分 {score(game, 0)} → {score(preview, 0)}（+{score(preview, 0) - score(game, 0)}）{card.reagent ? reactionPair(preview, 0).length && !reactionPair(game, 0).length ? ' · 激活组合：两张各 +4' : ' · 寻找另一张催化组合搭档' : card.ability === 'bond' ? ' · 同名组合按牌数相乘' : ''}</span></> : <span>{canPlay ? '先点击一张手牌' : game.players[0].passed ? '已停牌，剩余手牌保留' : '等待电脑行动'}</span>}</div><button className="primary" disabled={!canPlay || !card} onClick={() => card && dispatch({ type: 'card', id: card.id })}>出牌{preview ? ` +${score(preview, 0) - score(game, 0)}` : ''}</button><button disabled={!canPlay} onClick={() => setConfirmPass(true)}>本局不再出牌</button></div>}
    </>}
    {confirmPass && <div className="cg-overlay"><section role="dialog" aria-modal="true" aria-label="确认本局停牌" className="cg-dialog"><h2>把剩下的牌留给下一局？</h2><p>你 {score(game, 0)} 分，对手 {score(game, 1)} 分。</p><p>{score(game, 0) > score(game, 1) && game.players[1].passed ? '对手已停牌，你将赢下本局。' : '确认后，本局不能继续出牌；对手仍可继续出牌追分。'}剩余 {game.players[0].hand.length} 张牌会保留。</p><button autoFocus onClick={() => setConfirmPass(false)}>继续出牌</button><button className="primary" onClick={() => dispatch({ type: 'pass' })}>确认，本局收手</button></section></div>}
    {confirmExit && <div className="cg-overlay"><section role="dialog" aria-modal="true" aria-label="退出对局" className="cg-dialog"><h2>离开当前对局？</h2><p>当前牌局不保存，下次会从教学入口开始。</p><button autoFocus onClick={() => setConfirmExit(false)}>继续玩</button><button onClick={onBack}>离开</button></section></div>}
    <footer>三种角度：观察现象 · 理解微粒 · 使用化学语言。卡牌分数和组合技能是游戏设定。</footer></div></main>;
}
