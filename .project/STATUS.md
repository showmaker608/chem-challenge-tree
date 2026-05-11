# 化学知识挑战树 — 项目状态

## 愿景
教培老师做初中化学游戏化刷题产品，让学生通过闯关解锁的方式对化学产生兴趣。最终形态：网页/小程序，支持跨设备跟踪学生进度。

## 当前阶段：MVP 完善 + 大陆可访问部署方案

### 已完成
- [x] Vite + React + TS + TailwindCSS 项目搭建
- [x] 技能树可视化（章节折叠、锁定/可用/完成三态、脉冲动画）
- [x] 答题弹窗（选择题、答对+XP、答错显示解析、解锁下一节点）
- [x] XP/等级系统（Lv1化学小白 → Lv10元素之主，连胜奖励）
- [x] 深色科幻主题 + 移动端响应式
- [x] localStorage 进度保存
- [x] 8章51个知识点题目数据（Ch1-Ch7 + Ch8八下期中复习）
- [x] Build 零错误，npm run dev 可运行
- [x] ch8 八下期中复习专章（21个知识点42道题，实验题占60%+）
- [x] 从4套一模卷子提取实验题（用pdftotext）
- [x] 学生档案入口雏形：班级码 + 姓名/学号 + 4位 PIN
- [x] 按学生档案隔离本机进度保存（为后续云端同步预留 profileId）
- [x] 私有班级码后端校验骨架：前端生产环境调用后端，不允许访客创建班级码
- [x] 新增 CloudBase 云函数 `validateClassCode`，仅校验单个 active 班级码，不提供列表/创建接口
- [x] 登录失败限流：1 分钟内班级码校验失败 5 次后暂停登录并显示倒计时
- [x] 题目质疑入口：每道题可提交文字反馈，当前先保存在本机 localStorage
- [x] 本机私有分发表 `CLASS_ACCESS.local`：设计班级码、学号、PIN 和发放话术，不上传 GitHub
- [x] Duolingo 风格跳关挑战：锁定节点可点击，答前置挑战通过后解锁
- [x] 知识点 prerequisites 字段：已给 `ch1-n3 常见仪器及使用方法` 配置前置知识 `ch1-n1/ch1-n2`
- [x] 从 `八下复习` 扩充“海水提盐与粗盐提纯”示范题库：新增 1 个小节、5 个知识点、30 道题
- [x] 修复 lint 问题：章节默认展开不再依赖 effect，localStorage 失败有兜底
- [x] 修复重复完成节点仍加 XP 的问题

### 进行中
- [ ] 大陆可访问部署：优先评估阿里云 OSS/COS + CDN，Vercel 不再作为大陆主入口
- [ ] 云端进度同步方案选型：Supabase/自建后端/国内云数据库
- [ ] 部署 CloudBase 云函数并配置生产环境 `VITE_CLASS_CODE_VALIDATE_URL`
- [ ] 在 CloudBase 数据库 `classes` 集合中手动创建你的私有班级码
- [ ] 将题目质疑反馈从 localStorage 接入 CloudBase 数据库，方便老师统一查看

### 待做
- [ ] 真正的跨设备进度同步：当前只是“学生档案 + 本机 localStorage”，不是云端账号
- [ ] 教师看板：按班级码查看学生完成率、错题、跳关挑战情况
- [ ] 批量学生管理：导入名单、避免同名冲突、重置 PIN
- [ ] 把所有知识点补全 prerequisites，而不是仅靠默认前一个节点
- [ ] 跳关挑战题库优化：现在从前置知识点现有 challenges 顺序抽取，后续应支持独立 unlockQuiz
- [ ] 按“海水提盐与粗盐提纯”的模板继续扩题：水净化、电解水、氧气/二氧化碳实验、燃烧灭火、化学式计算
- [ ] 小程序适配（Taro/Uni-app 或 H5 WebView）
- [ ] 更多互动元素（短视频嵌入、实验动画等）

## 技术栈
- 前端：Vite + React 19 + TypeScript + TailwindCSS 4
- 状态：React hooks + localStorage（按学生 profileId 分桶）
- 数据：src/data/quizData.ts（静态 JSON，KnowledgePoint 支持 prerequisites）
- 构建产物：dist/（可直接部署）

## 关键文件
| 文件 | 用途 |
|------|------|
| src/App.tsx | 主入口，连线所有组件 |
| src/data/quizData.ts | 题目数据（8章56个知识点，ch8 已新增海水提盐专题） |
| src/types.ts | 类型定义 + 等级/XP 常量 |
| src/hooks/useGameState.ts | 游戏状态管理（localStorage） |
| src/services/classAccess.ts | 班级码校验 API 封装，本地 dev mock，生产走后端 |
| src/services/loginGuard.ts | 登录失败限流，本机 1 分钟 5 次失败锁定 |
| src/services/questionFeedback.ts | 题目质疑反馈本机保存 |
| src/components/StudentGate.tsx | 学生档案入口（班级码/姓名/PIN） |
| src/components/UnlockChallengeModal.tsx | 跳关前置挑战弹窗 |
| cloudfunctions/validateClassCode/ | CloudBase 班级码校验云函数 |
| src/components/SkillTree.tsx | 技能树主组件 |
| src/components/QuizModal.tsx | 答题弹窗 |
| src/components/StatusBar.tsx | 顶部等级/XP 状态栏 |
| 讲义/ | 老师上传的讲义文件（用于补充题目） |

## 部署目标
- 大陆学生主入口：阿里云 OSS/COS 静态网站 + CDN（有备案域名时最稳）
- 临时海外/香港入口：可用 GitHub Pages、Cloudflare Pages、Vercel、香港对象存储等，但大陆稳定性不可保证
- 域名：待定

## 当前关键判断
- 不建议第一版做手机号/微信重账号；更适合教育场景的是“班级码 + 学生标识 + PIN”。
- 班级码不应由访客创建，也不应写死在前端。生产环境必须通过后端校验；CloudBase `classes` 集合由站长/老师手动维护。
- 但只靠 localStorage 仍然不能跨设备恢复。当前代码只是把学生身份模型和交互先跑通，后续必须接云端存储。
- 跳关机制采用“前置挑战通过才开放目标节点”，比硬锁更灵活，也比完全自由复习更有教学约束。
- 仓库已跟踪大量试卷/讲义资料，网页运行本身不需要这些文件；公开仓库部署前建议评估版权和仓库体积。
- 题库扩容策略：不要直接照搬整卷原题，优先把卷子和知识清单拆成“考点簇”，每个知识点至少 6 道变式题，并在解析里说明错项为什么错。

## 更新日志
- 2026-05-10：新增 1 分钟 5 次失败登录限流、题目质疑本机反馈、私有班级码/PIN 本地分发表；build/lint 通过
- 2026-05-10：实现私有班级码后端校验骨架：新增前端 `classAccess` 校验封装、CloudBase `validateClassCode` 云函数、`.env.example`；生产构建不包含本地测试班级码；build/lint 通过
- 2026-05-10：基于 `八下复习` 新增 ch8 “海水提盐与粗盐提纯”小节，包含海水晒盐、粗盐流程、过滤蒸发、产率误差、NaCl 溶解微观过程，共 5 节点 30 题；build/lint 通过
- 2026-05-10：新增学生档案入口、按档案隔离进度、跳关前置挑战；build/lint 通过，并在本地浏览器走通“常见仪器及使用方法”跳关流程
- 2026-05-09：审阅部署方案，确认项目是纯静态站，建议大陆主入口改用国内对象存储/CDN
- 2026-05-08：新增ch8八下期中复习专章（21知识点42题，从4套一模卷提取）
- 2026-05-07：MVP 完成，7章30知识点，build 通过
- 2026-05-07：创建项目状态文件，规划下一步（补题+部署）

## 数据源
- `八下复习/` — 4套期中模拟卷（学生版+答案版）+ 知识清单
- `八下复习/extracted/` — pdftotext提取的文本（中间文件）
- `一模卷子/` — 2024/2025各区一模卷（后续可补充更多题目）
