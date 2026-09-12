# Chemistry Gwent v2 visual QA

## 入口简化与对战复核 — 2026-09-11

- 首页已收敛为开始对决/我的牌组，帮助与声音为角落入口；原有练习没有删除。首次默认直接开局，老玩家沿用保存牌组进入可选换牌阶段。
- 新增 `scripts/test-gwent-entry.tsx`，覆盖首页主次入口、首次直达、回访牌组和上下文提示；构建、局部 ESLint、200 场构筑及 100 场旧规则模拟通过。
- 浏览器实测入门开局、出牌/制气提示、关闭引导、退出确认、保存牌组回首页、重新打开后使用保存牌组、帮助里的可选练习。
- 390px 对局实测精密测量选目标并使氮气 5→8；间谍令对方 +4、己方手牌 8→9、备用 6→4。这些通过结果替代下方同类“未完成”的旧验收项，不代表所有英雄/战术组合的 UI 均已完整验收。
- 390px 首页 document width 390，战斗页 document width 384，均未超过视口。默认窗口约 607px 时发现展示卡横向裁切，改成流式宽度并复核；字号随卡宽变化，名称和化学式分行清楚。临时视口已重置。
- 证据：`output/chem-gwent-entry-v3/home-final.png`、`mobile-home.png`、`mobile-battle.png`。生产部署、真实设备/学生试玩、宽桌面全流程与完整无障碍验收仍未完成。

final result: passed for ten-card portrait integration; full-game release review remains separate

## Final continuation — 2026-09-11

- Recovered the three completed images from the interrupted generation call, visually identified nitrogen / iron / silica, and installed all seven new portraits. Every current card now has an independent academy-scene portrait; the old atlas remains archived only.
- All thirteen assets preserve original PNG dimensions and alpha; WebP delivery totals 3.93 MiB versus 28.38 MiB PNG. No illustration was repainted or synthesized with code.
- `bun scripts/test-gwent-art.ts`: all ten identities have distinct existing WebP and PNG resources across all lessons and both players. Unknown cards cannot silently borrow another substance portrait.
- Production build, focused ESLint, all reaction-order tests and 100 AI matches passed. Existing unrelated large-chunk build warning remains.
- Final browser evidence: `output/chem-gwent-v2/silica-final.png` shows the final enlarged quartz card; `output/chem-gwent-v2/hand-final.png` shows copper, iron, nitrogen and silica together in the live hand. All displayed correctly, with readable names/formulae and no browser error logs. Default narrow app viewport, no wide-desktop claim.
- Prior continuation also checked live carbonate portrait at 390px, no page overflow; early inspection chain and life 2→1. No rule changes were made in this art-completion pass.
- These findings supersede the historical seven-portrait and WebP blockers below. This passes the requested portrait-completion scope, not all possible gameplay/accessibility/release QA. Life 0 visual state and a full wide-desktop regression remain future release checks. No deployment.

## Target and evidence

- 2026-09-10 continuation: new carbonate/catalyst/splint/copper portraits inspected against their original character identities and the approved peroxide academy scene. New files `carbonate-desktop.png` (actual default viewport 589×836, not a wide desktop) and `carbonate-mobile.png` (390×844) show live card-detail rendering. Mobile document width 384 < viewport 390. Final batch integration remains in progress.
- Live WebP game check confirmed early limewater → carbonate → acid reaches 20 points, with local “变浑浊 +9” feedback; AI oxygen chain reaches 21. Native screenshot confirms corrected board inset and life 2→1 appearance. Full-page capture from this browser renders surplus white space, so use viewport captures for handoff evidence.

- Source visual truth: `/Users/xudingkun/.codex/generated_images/01a083df-ec6e-7ae0-b004-bb3b21b92c4e/exec-4019edbe-d5ec-4478-a71a-475b6994c136.png` (1536×1024 three-card concept).
- Implementation: `output/chem-gwent-v2/welcome-desktop.png` and `output/chem-gwent-v2/inspect-desktop.png` (1274×717 browser captures).
- Route: `http://127.0.0.1:5187/?play=chem-gwent`.
- Desktop default viewport approximately 1274×717; mobile override 390×844, observed document width 384, no horizontal page overflow.
- Source is a card presentation, not a complete game-screen specification. Comparison was limited to illustrated card/frame/nameplate proportions and quality, not a claimed pixel-perfect whole-page clone. No density-normalized pixel diff was performed.
- Source and desktop inspect screenshot were opened together in one tool result for focused visual comparison. Mobile card-detail screenshot, playing bench and 2→1 life state were also inspected in the browser but not all were saved before interruption.

## Findings and iteration history

1. [P1, addressed] Diamond text glyphs were visually crude. Replaced with generated transparent enamel/brass life-orb images. Browser confirmed two illuminated orbs versus one illuminated and one dimmed; accessible label reports remaining lives out of two.
2. [P1, addressed for three selected cards] Tiny sprite illustrations and plain borders lost the reference quality. Added three independent academy-scene portraits and a shared generated frame. Desktop and 390px enlarged-card views show readable names, formulae and complete subjects.
3. [P2, final recheck blocked] Lower board decoration sat too close to a placed card. Increased table padding from 16px to 32px top / 64px bottom. Post-fix capture still required.
4. [P2, outstanding broader art consistency] Seven remaining cards retain the earlier atlas. Their illustration backgrounds and detail level are not yet consistent with the three upgraded portraits. Do not describe the entire deck as visually finished.
5. [P2, final recheck blocked] Delivery assets converted from PNG to WebP, full resolution and alpha retained; total 12.42 MiB → 1.65 MiB. Final browser visual regression check was denied by usage-limit approval, not by an app crash. Do not bypass the browser restriction using another surface.

## Required fidelity surfaces

- Typography: serif display labels and formulae visually match the reference direction; desktop and mobile names fit. Game text remains DOM text rather than baked-in generated spelling. No exact font match claimed.
- Spacing: fixed 2:3 card frames, nameplate below illustration; compact hand and larger inspect view. Board lower inset correction needs recapture.
- Color: teal enamel, warm brass, ivory nameplate; life loss desaturates/dims one orb. Board retains the app's green direction but adds illustrated wood/felt material.
- Image quality: real raster frame, life tokens and three detailed portraits; alpha checked in source; original PNGs preserved. Remaining seven atlas cards still require individual art.
- Copy: life remains two round-loss allowances, not a new damage rule. “检验待命” and “如何检验呢？” preserved; facts remain in optional detail view.

## Interaction / code checks

- Inspected card-detail open/close, hand selection, early limewater play and computer response.
- Browser observed life reduction 2→1 before final asset conversion.
- Mobile DOM width check passed; browser error log was empty before interruption.
- Latest local ESLint, production build, 100 AI matches and reaction-chain tests passed.
- After the final resumption, a test pass action was submitted; the subsequent screenshot was rejected by browser usage limits. Final browser state is therefore unverified.

## Remaining checklist

1. Restore browser verification and capture corrected lower board edge, WebP sharpness, and life 2/1/0 states.
2. Reset any surviving mobile viewport override when browser access is available.
3. Completed 2026-09-11: all seven remaining portraits now use the selected art standard.
4. Run a new source-versus-implementation visual comparison before marking the full game visually finished. No deployment performed.
## 自由组牌扩展验收（2026-09-11）

范围：`GwentDeckBuilder`、17 种卡池、16 张构筑、战术选目标、两位英雄和访问学者。此前验收历史保留在下方，不将旧版移动端结果视为本版通过。

- 通过：生产构建、相关源码 ESLint、13 张独立立绘资源及 PNG 源文件检查。
- 通过：200 场完整构筑模拟、100 场旧引擎模拟、所有教学关卡、两种化学链的全部六种先后顺序。详见 `scripts/test-gwent-duel.ts` 和 `scripts/test-chem-gwent.ts`。
- 浏览器已见：完整组牌页面、分类筛选、移除导师后 15/16 禁止开战、改选见证者后 16/16 可开战、预设切换、保存并进入 10 张起手、两次换牌、开战。电脑间谍已实际将玩家场面加 4，电脑手牌由 10 到 11、备用由 6 到 4；玩家间谍选中后的预览显示对手 +4、抽 2 张。
- 桌面截图检查发现卡牌被列方向 flex-basis 压成方形，已用 `flex:none` 修复并确认恢复 2:3；英雄名称与类别分行可读。
- 未完成：玩家间谍出牌后的 UI 结果、战术选目标/执行的完整浏览器流程、当前版本 390px 手机排版、刷新恢复牌组、最终截图保存。浏览器连接中途丢失，随后可用浏览器列表为空；不是规则测试失败。
- 先前桌面测试临时使用 1280×900 视口。连接丢失前无法执行视口重置，恢复连接时应先重置或按实际验证尺寸设置。
- 本地版本，未部署；真实学生试玩、英雄/间谍平衡性仍需收集反馈，不宣称已达到最终成品验收。
