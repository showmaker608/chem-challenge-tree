# AGENTS.md - 化学知识挑战树工作指南

> 本文档指导 AI 编程助手理解坤哥的初中化学游戏化刷题网站。进入本项目后，先读本文件，再读 `CLAUDE.md`、`README.md`、`VISION.md` 和 `.project/STATUS.md`（如存在）。

## 项目定位

- 项目名：化学知识挑战树
- 路径：`/Users/xudingkun/Projects/chem-challenge-tree`
- 面向对象：中国大陆初中生，沪教版初中化学
- 核心体验：像打游戏一样学化学，通过技能树闯关、错题本、排行榜、论坛、学习报告提升练习动力
- 线上地址：`https://xdkchem-d1g3f4ibw03b1b776-1372708082.tcloudbaseapp.com`

## 技术栈

- 前端：Vite + React + TypeScript + TailwindCSS
- 后端：腾讯云 CloudBase 云函数，Node.js 18
- 状态：localStorage + 云端同步
- 常用命令优先参考 `package.json` 和 `CLAUDE.md`

## 关键文件

| 文件/目录 | 作用 |
|---|---|
| `src/data/quizData.ts` | 全部题目与知识树数据源 |
| `src/data/seniorG10Summer.ts` | 高一暑假相关数据 |
| `src/types.ts` | 题目、知识点、章节、学生状态等类型 |
| `src/hooks/useGameState.ts` | 核心状态、数据迁移、本地与云端合并 |
| `src/components/QuizModal.tsx` | 答题弹窗，普通题和综合大题 |
| `src/components/SkillTree.tsx` | 技能树与章节解锁 |
| `src/components/WrongBook.tsx` | 错题本 |
| `cloudfunctions/studentLogin` | 注册登录 |
| `cloudfunctions/syncProgress` | 进度同步，防旧数据覆盖 |

## 最高优先级：保护学生数据

- 永远不要随意改 `profileId` / `studentKey` 格式，当前格式是 `${classCode}:${studentId}`。
- 修改 `PlayerState` 结构时，要同步检查 `migrateState()` 和数据版本。
- 登录和同步逻辑要避免旧设备覆盖新进度。
- 邀请码注册会消耗名额，登录不消耗；不要混淆 `register` 和 `login`。

## 题目与教学设计规则

- 新增题目优先来自历年期中、一模、名校试题汇编，并改写成适合闯关的表达。
- 题干要清楚，解释要能纠偏，不能只给答案。
- 综合题用 `bigQuestion`，保持 4-5 道子题的真实考试感。
- 知识点 id 和 prerequisites 必须匹配已有节点。
- 交互组件应服务真实试卷迁移，优先高频实验、图像、装置、读数、除杂、鉴别等模型。
- 超纲内容放进可展开知识卡片，不压在主线学习路径里。

## 前端体验规则

- 面向学生，界面可以有游戏感，但不要牺牲可读性和做题效率。
- 移动端优先，手机、平板、电脑都要能用。
- 互动数据、文字说明、刻度、液面、装置图不能互相遮挡。
- 探索类交互不要提前剧透结论，应让学生先操作、观察、再归纳。

## 验证

- 修改代码后优先运行项目现有检查命令，例如 `bun run build` 或 `npm run build`，以 `package.json` 为准。
- 涉及页面体验时，启动本地服务并用浏览器检查关键路径。
- 涉及云函数或部署时，先确认 CloudBase 环境和 CLI 登录状态，不盲目部署。

最后更新：2026-05-28
