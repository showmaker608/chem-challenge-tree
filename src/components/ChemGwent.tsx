import { useEffect, useRef, useState } from 'react';
import { act, power, score, cardState, chooseAI, skillTargets, cardActions, comboInfo } from '../gwent/engine';
import type { Action, Card, Game, Side, Experiment } from '../gwent/engine';
import { createLesson, easyAI, guide, lessonNames } from '../gwent/onboarding';
import type { Lesson } from '../gwent/onboarding';
import { TableAudio } from '../gwent/audio';
import { readDeck } from '../gwent/duel';
import { gameAsset } from '../gwent/artwork';
import { INTRO_KEY, createQuickMatch, quickHint } from '../gwent/entry';
import { GwentDeckBuilder } from './GwentDeckBuilder';
import { GwentCardFace } from './GwentCardFace';
import { MatchActionFeed, RoundRecap } from './MatchActionFeed';
import { keyRoundEvent, matchEvent } from '../gwent/matchEvents';
import { GwentCardDetails } from './GwentCardDetails';
import './ChemGwent.css';
import './ChemGwentArt.css';
import './GwentDeckBuilder.css';
function preferences() { try { return JSON.parse(localStorage.getItem('chem-gwent-audio') || '{}'); } catch { return {}; } }
const chainText: Record<Experiment['kind'], { tester: string; testedTitle: string; testedDetail: string; produceDetail: string; effect: string; playLabel: string; describe: string; equation: string; productsNote: string; testedNote: string }> = {
  carbon: { tester: 'limewater', testedTitle: '变浑浊', testedDetail: '二氧化碳通入石灰水 · 变浑浊', produceDetail: '碳酸钙＋稀盐酸 → 生成二氧化碳', effect: 'cloud', playLabel: '通入石灰水', describe: '石灰水变浑浊', equation: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑', productsNote: '完整生成物：氯化钙、水、二氧化碳。', testedNote: 'CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O；本次少量气体检验到此结束。' },
  oxygen: { tester: 'splint', testedTitle: '复燃', testedDetail: '带火星的木条复燃', produceDetail: '二氧化锰催化 · 生成氧气', effect: 'fire', playLabel: '伸入木条', describe: '木条复燃', equation: '2H₂O₂ → 2H₂O + O₂↑（二氧化锰催化）', productsNote: '完整生成物：水、氧气。二氧化锰未消耗。', testedNote: '氧气支持木条燃烧，木条复燃；检验到此结束。' },
  hydrogen: { tester: 'flame', testedTitle: '爆鸣', testedDetail: '点燃氢气 · 发出爆鸣声', produceDetail: '金属＋稀盐酸 → 生成氢气', effect: 'fire', playLabel: '点燃气体', describe: '氢气爆鸣', equation: 'Fe + 2HCl → FeCl₂ + H₂↑（镁带亦可：Mg + 2HCl → MgCl₂ + H₂↑）', productsNote: '金属与稀盐酸反应生成盐和氢气。', testedNote: '氢气燃烧生成水；可燃气体点燃前必须验纯，检验到此结束。' },
};
export function ChemGwent({ onBack }: { onBack: () => void }) {
  const [lesson, setLesson] = useState<Lesson>('first');
  const [game, setGame] = useState<Game>(() => createLesson('first'));
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [inspect, setInspect] = useState<Card | null>(null);
  const [settings, setSettings] = useState(false);
  const [rules, setRules] = useState(false);
  const [confirmPass, setConfirmPass] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [notice, setNotice] = useState('');
  const [building, setBuilding] = useState(false);
  const [returning, setReturning] = useState(() => { try { return localStorage.getItem(INTRO_KEY) === 'done'; } catch { return false; } });
  const [intro, setIntro] = useState(false);
  const [hints, setHints] = useState(true);
  const [homeNotice, setHomeNotice] = useState('');
  const [deckKeys, setDeckKeys] = useState<string[]>(() => { try { return readDeck(localStorage.getItem('chem-gwent-deck-v1')); } catch { return readDeck(null); } });
  const [saveError, setSaveError] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal'>(() => { try { return localStorage.getItem('chem-gwent-difficulty') === 'normal' ? 'normal' : 'easy'; } catch { return 'easy'; } });
  function pickDifficulty(level: 'easy' | 'normal') { setDifficulty(level); try { localStorage.setItem('chem-gwent-difficulty', level); } catch { /* The match still works without persistence. */ } }
  const [target, setTarget] = useState<string>();
  const [replacement, setReplacement] = useState<string>();
  const [swapOut, setSwapOut] = useState<string>();
  const [swapIn, setSwapIn] = useState<string>();
  const [dealtId, setDealtId] = useState<string>();
  useEffect(() => { if (!dealtId) return; const timer = window.setTimeout(() => setDealtId(undefined), 900); return () => window.clearTimeout(timer); }, [dealtId]);
  const [duelEvent, setDuelEvent] = useState<string>('');
  const [recentAction, setRecentAction] = useState<ReturnType<typeof matchEvent>>(null);
  const [roundActions, setRoundActions] = useState<NonNullable<ReturnType<typeof matchEvent>>[]>([]);
  useEffect(() => { if (!duelEvent) return; const timer = window.setTimeout(() => setDuelEvent(''), 2800); return () => clearTimeout(timer); }, [duelEvent]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') { setInspect(null); setConfirmPass(false); setConfirmExit(false); } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  const [burst, setBurst] = useState<{id: string; side: Side; title: string; detail: string; bonus: number; effect: string; cards: string[]} | null>(null);
  useEffect(() => { if (!burst) return; const timer = window.setTimeout(() => setBurst(null), 2400); return () => window.clearTimeout(timer); }, [burst]);
  function respond(before: Game, next: Game) {
    const side = before.turn;
    const played = before.players[side].hand.find(c => c.ability !== 'unit' && !next.players[side].hand.some(x => x.id === c.id));
    if (played && before.phase === 'play') {
      const who = side === 0 ? '你' : '电脑';
      const blocked = played.skill === 'challenge' && next.tactics?.witnessUsed.length !== before.tactics?.witnessUsed.length;
      setDuelEvent(`${who} · ${blocked ? '见证者挡下质疑' : played.ability === 'spy' ? `访问学者到访 · 对手 +4 · 抽 ${next.players[side].hand.length - before.players[side].hand.length + 1} 张` : played.name}`);
    }
    const previous = before.experiments?.[side] || [];
    const record = next.experiments?.[side].find(e => !previous.some(p => p.id === e.id) || (e.testedBy && !previous.find(p => p.id === e.id)?.testedBy));
    if (!record) { audio.current?.effect(next.phase === 'round' || next.phase === 'over' ? 'round' : 'play'); return; }
    const tested = !!record.testedBy;
    const created = !previous.some(p => p.id === record.id);
    const mentorBonus = next.tactics?.mentorUsed.includes(side) && !before.tactics?.mentorUsed.includes(side) ? 2 : 0;
    const bonus = (created ? record.kind === 'carbon' ? 4 : 8 : 0) + (tested ? 5 : 0) + mentorBonus;
    setBurst({id: `${record.id}-${tested}`, side, title: tested ? chainText[record.kind].testedTitle : '生成气体', detail: tested ? chainText[record.kind].testedDetail : chainText[record.kind].produceDetail, bonus, effect: tested ? chainText[record.kind].effect : 'gas', cards: [...record.cards, ...(record.testedBy ? [record.testedBy] : [])]});
    audio.current?.effect(tested ? 'inspect' : 'reaction');
  }
  const [musicOn, setMusicOn] = useState<boolean>(() => preferences().music !== false);
  const [fxOn, setFxOn] = useState<boolean>(() => preferences().fx !== false);
  const [volume, setVolume] = useState<number>(() => { const v = preferences().volume; return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : .55; });
  const [audioError, setAudioError] = useState(false);
  const audio = useRef<TableAudio | null>(null);
  useEffect(() => { const player = new TableAudio(); audio.current = player; return () => { player.dispose(); audio.current = null; }; }, []);
  useEffect(() => { audio.current?.settings(musicOn, fxOn, volume); try { localStorage.setItem('chem-gwent-audio', JSON.stringify({ music: musicOn, fx: fxOn, volume })); } catch { /* Private browsing may deny storage. */ } }, [musicOn, fxOn, volume]);
  useEffect(() => { const hide = () => { if (document.hidden) void audio.current?.pause(); else if (started) void audio.current?.start(musicOn, fxOn, volume).catch(() => setAudioError(true)); }; document.addEventListener('visibilitychange', hide); return () => document.removeEventListener('visibilitychange', hide); }, [started, musicOn, fxOn, volume]);
  function soundStart() { void audio.current?.start(musicOn, fxOn, volume).then(() => setAudioError(false)).catch(() => setAudioError(true)); }
  function rememberIntro() { setReturning(true); try { localStorage.setItem(INTRO_KEY, 'done'); } catch { /* The match still works without persistence. */ } }
  function home() { setStarted(false); setBuilding(false); setRules(false); setConfirmExit(false); setConfirmPass(false); setSelected(null); setInspect(null); setSwapOut(undefined); setSwapIn(undefined); setBurst(null); setDuelEvent(''); setRecentAction(null); setRoundActions([]); void audio.current?.pause(); }
  const card = game.players[0].hand.find(c => c.id === selected);
  const canPlay = started && game.phase === 'play' && game.turn === 0 && !game.players[0].passed;
  function describe(before: Game, next: Game, action: Action): string {
    const who = before.turn === 0 ? '你' : '电脑';
    if (action.type === 'swap') { const out = before.players[0].hand.find(c => !next.players[0].hand.some(x => x.id === c.id)); const into = next.players[0].hand.find(c => !before.players[0].hand.some(x => x.id === c.id)); return `已把「${out?.name ?? '一张牌'}」换成「${into?.name ?? '一张牌'}」，还可换 ${2-next.swaps} 张。`; }
    if (action.type === 'start') return `${next.starter === 0 ? '你' : '电脑'}先手，对决开始。`;
    if (action.type === 'pass') return `${who}本局不再出牌，保留剩余手牌。`;
    if (action.type !== 'card') return '';
    const c = before.players[before.turn].hand.find(x => x.id === action.id)!;
    if (c.ability !== 'unit' && before.duel) return next.log[next.log.length - 1];
    const records = next.experiments?.[before.turn] || [];
    const completed = records.find(e => e.testedBy && !before.experiments?.[before.turn].some(old => old.id === e.id && old.testedBy));
    if (completed) return `${who}完成检验：${chainText[completed.kind].describe}。总分 ${score(before,before.turn)} → ${score(next,before.turn)}。`;
    if (records.length > (before.experiments?.[before.turn].length || 0)) return `${who}完成制气，生成${records[records.length-1].product}。如何检验呢？`;
    const count = next.players[before.turn].board.filter(x => x.name === c.name).length;
    return `${who}打出「${c.name}」：${c.ability === 'bond' && count > 1 ? `${count} 张同名组合，每张 ${c.power} × ${count} = ${power(next, before.turn, c)} 分。` : `${c.power} 分。`}总分 ${score(before, before.turn)} → ${score(next, before.turn)}。`;
  }
  function recordAction(before: Game, next: Game, action: Action) {
    const event = matchEvent(before, next, action);
    if (action.type === 'next') { setRecentAction(null); setRoundActions([]); return; }
    if (!event) return;
    setRecentAction(event);
    setRoundActions(actions => [...actions, event]);
  }
  function dispatch(action: Action) { const next = act(game, action); if (next === game) return; setGame(next); if (intro && next.phase === 'over') rememberIntro(); setNotice(describe(game, next, action)); recordAction(game, next, action); setSelected(null); setTarget(undefined); setReplacement(undefined); setConfirmPass(false); respond(game, next); }
  useEffect(() => {
    if (!started || building || game.phase !== 'play' || game.turn !== 1 || burst || duelEvent) return;
    const timer = window.setTimeout(() => { const action = game.duel ? chooseAI(game, { level: difficulty }) : easyAI(game, lesson); const next = act(game, action); setGame(next); if (intro && next.phase === 'over') rememberIntro(); setNotice(describe(game, next, action)); recordAction(game, next, action); respond(game, next); }, 1500);
    return () => window.clearTimeout(timer);
  }, [game, started, lesson, burst, duelEvent, building, intro, difficulty]);
  function begin(next: Lesson) { setIntro(false); setRules(false); setBuilding(false); setBurst(null); setDuelEvent(''); setRecentAction(null); setRoundActions([]); setLesson(next); setGame(createLesson(next)); setSelected(null); setTarget(undefined); setReplacement(undefined); setSwapOut(undefined); setSwapIn(undefined); setInspect(null); setNotice('你先手。点击手牌，再点出牌。'); setStarted(true); setConfirmPass(false); soundStart(); }
  function saveDeck(keys: string[]) {
    setDeckKeys(keys); setSaveError(false); try { localStorage.setItem('chem-gwent-deck-v1', JSON.stringify(keys)); setHomeNotice('牌组已保存，下一场就用它。'); } catch { setSaveError(true); setHomeNotice('牌组本次可用，但浏览器未允许保存。'); }
    rememberIntro(); home();
  }
  function startQuick(forceDuel = false) {
    const experienced = returning || forceDuel;
    if (forceDuel) rememberIntro();
    setGame(createQuickMatch(deckKeys, experienced)); setIntro(!experienced); setHints(true); setLesson(experienced ? 'practice' : 'bond'); setRules(false); setStarted(true); setBuilding(false); setSelected(null); setTarget(undefined); setReplacement(undefined); setSwapOut(undefined); setSwapIn(undefined); setInspect(null); setBurst(null); setDuelEvent(''); setRecentAction(null); setRoundActions([]); setNotice(experienced ? '牌组已带好，可以直接开战，也可换两张起手牌。' : '你先手，选一张手牌开始对决。'); setConfirmPass(false); setHomeNotice(''); soundStart();
  }
  const hint = intro && hints ? quickHint(game) : null;
  const playAction: Action | null = card ? { type: 'card', id: card.id, target, replacement } : null;
  const proposed = playAction && canPlay ? act(game, playAction) : null;
  const preview = proposed === game ? null : proposed;
  const targets = card && canPlay ? skillTargets(game, 0, card) : [];
  const needsTarget = card?.ability === 'tactic';
  const targetHint = !card ? '先点击一张手牌' : !canPlay ? '等待电脑行动' : needsTarget
    ? !cardActions(game, 0, card).length ? '目前没有可用目标，可选择其他牌' : !target ? '点击发光的场上牌，选择目标' : card.skill === 'relay' && !replacement ? '再点击要换上的手牌' : '目标已选定'
    : card.ability === 'spy' ? `给对手 4 分 · 抽 ${Math.min(2, game.players[0].deck.length)} 张备用牌` : card.ability === 'hero' ? card.fact : '';
  const inspection = preview?.experiments?.[0].find(e => e.testedBy === card?.id && !game.experiments?.[0].some(old => old.testedBy === card?.id));
  const playLabel = inspection ? chainText[inspection.kind].playLabel : '出牌';
  const selectedEffect = card && (card.ability === 'unit' || card.ability === 'bond')
    ? `基础 ${card.power} 分${comboInfo(card.chemical)[0] ? `；${comboInfo(card.chemical)[0]}` : ''}`
    : card?.fact;
  const swapOutCard = game.players[0].hand.find(c => c.id === swapOut);
  const swapInCard = game.players[0].deck.find(c => c.id === swapIn);
  function confirmSwap() { if (!swapOutCard || !swapInCard) return; const incoming = swapInCard.id; dispatch({ type: 'swap', id: swapOutCard.id, with: swapInCard.id }); setDealtId(incoming); setSwapOut(undefined); setSwapIn(undefined); }
  const lastTap = useRef<{ id: string | null; t: number }>({ id: null, t: 0 });
  function tile(c: Card, side?: Side, decorative = false) {
    const value = side === undefined ? c.power : power(game, side, c);
    const state = side === undefined ? '' : cardState(game,side,c);
    const eligible = targets.some(t => t.id === c.id);
    const mulliganHand = side === undefined && game.phase === 'mulligan' && game.players[0].hand.some(x => x.id === c.id);
    const mulliganDeck = side === undefined && game.phase === 'mulligan' && game.players[0].deck.some(x => x.id === c.id);
    return <button key={c.id} tabIndex={decorative ? -1 : undefined} aria-hidden={decorative || undefined} className={`cg-card cg-kind-${c.ability} ${selected===c.id?'selected':''} ${swapOut===c.id?'cg-picked-out':''} ${swapIn===c.id?'cg-picked-in':''} ${dealtId===c.id?'cg-dealt':''} ${eligible?'cg-targetable':''} ${target===c.id||replacement===c.id?'cg-target-chosen':''} ${state.startsWith('已')?'cg-used':''} ${burst && burst.side===side&&burst.cards.includes(c.id)?'cg-reacting':''}`} onDoubleClick={()=>{if(!decorative){setInspect(c);audio.current?.effect('inspect');}}} onClick={()=>{if(decorative)return;if(mulliganHand){if(!game.swapped.includes(c.id)) setSwapOut(swapOut===c.id?undefined:c.id);audio.current?.effect('select');return;}if(mulliganDeck){setSwapIn(swapIn===c.id?undefined:c.id);audio.current?.effect('select');return;}if(side===undefined){const now=Date.now();const doubleTap=lastTap.current.id===c.id&&now-lastTap.current.t<350;lastTap.current={id:c.id,t:now};if(doubleTap){setInspect(c);audio.current?.effect('inspect');return;}if(card?.skill==='relay'&&target&&c.ability==='unit'){setReplacement(c.id);}else{setSelected(c.id);setTarget(undefined);setReplacement(undefined);}}else if(eligible){setTarget(c.id);setReplacement(undefined);}else setInspect(c);audio.current?.effect('select');}} aria-label={`${c.name} ${value}分 ${state}${eligible?' 可选目标':''}${game.phase==='mulligan'?' 点选换牌；双击查看说明':' 点选使用；双击查看说明'}`} aria-pressed={side===undefined?selected===c.id:eligible?target===c.id:undefined}><GwentCardFace card={c} value={value} state={state} /></button>;
  }

  function board(side: Side) { const p=game.players[side]; return <section className={`cg-side side-${side}`} aria-label={side===0?'你的实验台':'电脑实验台'}><div className="cg-player"><strong>{side===0?'你的实验台':'电脑实验台'}</strong><span className="cg-lives" role="img" aria-label={`剩余生命 ${p.lives} / 2`} title="输一局熄灭一颗，全部熄灭则对决结束">{[0,1].map(i=><img key={i} src={gameAsset('life-orb-v2.webp')} alt="" className={i<p.lives?'cg-life lit':'cg-life lost'} />)}</span><small>手牌 {p.hand.length}{game.duel?` · 备用 ${p.deck.length}`:''}{p.passed?' · 已停牌':''}</small><b className="cg-total" key={score(game,side)}>{score(game,side)}</b></div><div className="cg-bench">{burst?.side===side && <div className={`cg-local-fx cg-fx-${burst.effect}`} key={burst.id}><span className="cg-fx-symbol" aria-hidden="true">{burst.effect==='fire'?'✦':burst.effect==='cloud'?'☁':'◌'}</span><span>{burst.title}</span><b>+{burst.bonus}</b><i/><i/><i/></div>}<div className="cg-units">{p.board.map(c=>tile(c,side))}{!p.board.length&&<span className="cg-empty">打出材料，开始实验</span>}</div></div></section>; }

  return <main className="cg cg-beginner"><div className="cg-shell"><header className="cg-header"><button onClick={() => building ? setBuilding(false) : started ? game.phase === 'over' ? home() : setConfirmExit(true) : onBack()}>← 返回</button><div><small>CHEMICAL COMPANIONS</small><h1>化学对决</h1></div><nav><button aria-label="帮助" title="帮助" aria-expanded={rules} onClick={() => setRules(!rules)}>?</button><button aria-label="声音设置" title="声音设置" aria-expanded={settings} onClick={()=>setSettings(!settings)}>♫</button></nav></header>
    {settings && <div className="cg-audio"><button aria-pressed={musicOn} onClick={() => { setMusicOn(!musicOn); void audio.current?.start(!musicOn, fxOn, volume).catch(() => setAudioError(true)); }}>♫ 音乐{musicOn ? '开' : '关'}</button><label>音量 <input aria-label="音乐音量" type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(Number(e.target.value))} /></label><button aria-pressed={fxOn} onClick={() => setFxOn(!fxOn)}>音效{fxOn ? '开' : '关'}</button>{audioError && <button onClick={soundStart}>点击重试播放音乐</button>}</div>}
    {rules && <section className="cg-rules" aria-label="游戏帮助"><h2>怎么玩</h2><p>轮流出牌，高分赢下本局。输一局熄灭一颗宝石，两颗都熄灭则整场结束。<br />“收手”会结束你本局的行动，剩余手牌留到下一局。</p><details><summary>组合与完整规则</summary><p>开局 10 张牌，局间清场、不补牌。上局胜者先手，平局交换先手；平分双方都失去一颗宝石。反应物使用一次后标记已反应；催化剂不消耗。产物只能接力检验一次，检验材料可以提前布置。木条代表检验操作的准备，不表示它会一直保持火星。每种制气组合每侧每局奖励一次。自由对战另有 6 张备用牌供间谍抽取。</p></details>{(!started || game.phase==='over')&&!building&&<details><summary>可选练习</summary><div className="cg-practice-links"><button onClick={()=>begin('first')}>出牌与留牌</button><button onClick={()=>begin('bond')}>二氧化碳接力</button><button onClick={()=>begin('reaction')}>氧气接力</button></div></details>}{intro&&started&&<button onClick={()=>{setHints(true);setRules(false);}}>显示局内提示</button>}</section>}
    {building ? <GwentDeckBuilder initial={deckKeys} onSave={saveDeck} onClose={()=>setBuilding(false)} /> : !started ? <section className="cg-welcome"><span className="cg-kicker">CHEMICAL COMPANIONS</span><h2>让化学伙伴，<br />产生一点反应。</h2><p>巧妙组合，赢下这一局。</p><div className="cg-showcase" aria-label="化学伙伴卡牌预览">{['acid','peroxide','limewater'].map(chemical=>tile(createLesson('bond').players[0].hand.find(c=>c.chemical===chemical)!,undefined,true))}</div><div className="cg-home-actions"><button className="primary cg-start" onClick={()=>startQuick()}>开始对决<span aria-hidden="true">→</span></button><button className="cg-deck-link" onClick={()=>{setBuilding(true);setHomeNotice('');setRules(false);}}>我的牌组</button></div><div className="cg-difficulty" role="group" aria-label="对手强度"><span>对手强度</span><button aria-pressed={difficulty==='easy'} onClick={()=>pickDifficulty('easy')}>轻松 · 它会犯错</button><button aria-pressed={difficulty==='normal'} onClick={()=>pickDifficulty('normal')}>认真 · 全力计算</button></div>{homeNotice&&<p role="status" className="cg-home-notice">{homeNotice}</p>}</section> : <>
      <section className="cg-coach"><small>{game.duel?`自由对战 · ${difficulty==='easy'?'轻松对手':'全力对手'}`:intro?'入门练习赛':lessonNames[lesson].replace(/^\d · /,'练习 · ')} · 第 {game.round} 局</small>{!intro&&lesson!=='practice'&&<details><summary>提示</summary><p>{guide(game, lesson)}</p></details>}{game.duel&&<details><summary>对战记录</summary>{game.log.slice(-6).map((line,i)=><p key={i}>{line}</p>)}</details>}{intro&&hints&&<button className="cg-dismiss-hint" onClick={()=>{setHints(false);rememberIntro();}}>关闭引导</button>}</section>
      {saveError&&<p role="alert">浏览器未允许保存牌组，本局仍可正常游玩。</p>}
      <MatchActionFeed event={recentAction} />
      {duelEvent&&<div className="cg-duel-event" role="status">{duelEvent}</div>}
      {game.phase==='mulligan'&&<section className="cg-mulligan"><p className="cg-mulligan-tip">点手牌选换出，点备用牌选换入 · 最多换 {2-game.swaps} 张 · {game.starter===0?'你先手':'电脑先手'}</p><div className="cg-mulligan-picks"><span className={swapOutCard?'filled':''}>{swapOutCard?swapOutCard.name:'换出'}</span><b aria-hidden="true">⇄</b><span className={swapInCard?'filled':''}>{swapInCard?swapInCard.name:'换入'}</span><button disabled={!swapOutCard||!swapInCard} onClick={confirmSwap}>交换</button></div><div className="cg-mulligan-actions"><button className="primary" onClick={()=>dispatch({type:'start'})}>开战</button><button onClick={()=>setBuilding(true)}>组牌</button></div></section>}
      {game.phase!=='mulligan'&&<div className="cg-layout"><div className="cg-table" style={{backgroundImage:`url('${gameAsset('table-v2.webp')}')`}}>{board(1)}<div className="cg-divider"><strong aria-live="polite">{game.phase !== 'play' ? game.result : game.turn === 0 ? '轮到你了' : '电脑准备出牌…'}</strong><span>你 {score(game, 0)} : {score(game, 1)} 电脑</span></div>{board(0)}</div><aside className="cg-battle-status" aria-label="对局摘要"><strong aria-live="polite">{game.phase !== 'play' ? game.result : game.turn === 0 ? '轮到你出牌' : '电脑行动中'}</strong><span>电脑 {score(game,1)} 分 · {game.players[1].lives} 生命 · {game.players[1].hand.length} 手牌</span><span>你 {score(game,0)} 分 · {game.players[0].lives} 生命 · {game.players[0].hand.length} 手牌</span></aside></div>}
      {([0,1] as const).map(side => (game.experiments?.[side] || []).map(e=><details className="cg-experiment" key={e.id} aria-label={`${side===0?'你的':'电脑的'}${e.product}反应记录`}><summary><strong>{side===0?'你':'电脑'}</strong><span className={`cg-product ${e.testedBy?'tested':''} ${side===0&&card?.chemical===chainText[e.kind].tester&&!e.testedBy?'ready':''}`}>产物 {e.product} · {e.testedBy?'已检验':'如何检验呢？'}</span></summary>{e.testedBy&&<p>{chainText[e.kind].testedDetail} · 接力＋5</p>}<details><summary>查看反应记录</summary><p>{chainText[e.kind].equation}</p><p>{chainText[e.kind].productsNote}本局只开放气体的一次检验接力。分数记录实验成果，不表示物质数量。</p>{e.testedBy&&<p>{chainText[e.kind].testedNote}</p>}</details></details>))}

      <div className="cg-sr-only" role="status" key={notice}>{notice || '下一局开始，剩余手牌继续使用。'}</div>
      {(game.phase === 'round' || game.phase === 'over') && <section className="cg-result"><h2>{game.result}</h2><p>本局总分：你 {score(game, 0)} · 电脑 {score(game, 1)}</p><RoundRecap event={keyRoundEvent(roundActions)} /><p>{game.phase === 'round' ? `你还剩 ${game.players[0].hand.length} 张牌，将全部保留到下一局。` : '换个思路，再来一场。'}</p>{game.phase === 'round' ? <button className="primary" onClick={() => dispatch({ type: 'next' })}>下一局 · 保留手牌</button> : <><button className="primary" onClick={() => startQuick(true)}>再来一局</button><button onClick={() => setBuilding(true)}>调整牌组</button></>}</section>}
      {hint&&<div className="cg-quick-hint" role="status">{hint}</div>}
      <section className="cg-hand"><div className="cg-hand-head"><strong>你的手牌 · {game.players[0].hand.length}</strong><small>{game.phase==='mulligan'?'点选换出 · 双击看说明':'点选出牌 · 双击看说明'}</small></div><div className="cg-hand-cards">{game.players[0].hand.map(c => tile(c))}{!game.players[0].hand.length && <p>没有手牌了，点“本局不再出牌”进入结算。</p>}</div></section>
      {game.phase==='mulligan'&&<section className="cg-hand cg-spare"><div className="cg-hand-head"><strong>备用牌 · {game.players[0].deck.length}</strong><small>点选换入 · 双击看说明</small></div><div className="cg-hand-cards">{game.players[0].deck.map(c => tile(c))}</div></section>}
      {game.phase === 'play' && <div className="cg-actions">
        <div className="cg-preview">
          {card ? <>
            <strong>{card.name} <button className="cg-info" onClick={() => setInspect(card)} aria-label={`查看${card.name}卡牌说明`}>ⓘ 说明</button></strong>
            <span className="cg-effect-line">{selectedEffect}</span>
            <span>{targetHint}</span>
            {preview && <span>你 {score(game, 0)} → {score(preview, 0)}{game.duel ? ` · 对手 ${score(game, 1)} → ${score(preview, 1)}` : ''}</span>}
            {needsTarget && target && <button onClick={() => { setTarget(undefined); setReplacement(undefined); }}>重选目标</button>}
          </> : <span>{canPlay ? '先点击一张手牌；选中后可按“ⓘ 说明”查看详情' : game.players[0].passed ? '已停牌，剩余手牌保留' : '等待电脑行动'}</span>}
        </div>
        <button className="primary" disabled={!canPlay || !preview} onClick={() => playAction && dispatch(playAction)}>{needsTarget ? '执行战术' : playLabel}{preview && !game.duel ? ` +${score(preview, 0) - score(game, 0)}` : ''}</button>
        <button disabled={!canPlay} onClick={() => setConfirmPass(true)}>收手</button>
      </div>}

    </>}
    {inspect && <GwentCardDetails card={inspect} onClose={()=>setInspect(null)} />}
    {confirmPass && <div className="cg-overlay"><section role="dialog" aria-modal="true" aria-label="确认本局停牌" className="cg-dialog"><h2>把剩下的牌留给下一局？</h2><p>你 {score(game, 0)} 分，对手 {score(game, 1)} 分。</p><p>{score(game, 0) > score(game, 1) && game.players[1].passed ? '对手已停牌，你将赢下本局。' : '确认后，本局不能继续出牌；对手仍可继续出牌追分。'}剩余 {game.players[0].hand.length} 张牌会保留。</p><button autoFocus onClick={() => setConfirmPass(false)}>继续出牌</button><button className="primary" onClick={() => dispatch({ type: 'pass' })}>确认，本局收手</button></section></div>}
    {confirmExit && <div className="cg-overlay"><section role="dialog" aria-modal="true" aria-label="退出对局" className="cg-dialog"><h2>返回游戏首页？</h2><p>当前对局不会保存，你的牌组会保留。</p><button autoFocus onClick={() => setConfirmExit(false)}>继续玩</button><button onClick={home}>返回首页</button></section></div>}
    <footer>完成反应，寻找证据。分数是游戏奖励，不表示物质数量。</footer></div></main>;
}
