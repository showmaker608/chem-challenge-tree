# 化学知识挑战树 — 项目状态

## 愿景
教培老师做初中化学游戏化刷题产品，让学生通过闯关解锁的方式对化学产生兴趣。最终形态：网页/小程序，支持跨设备跟踪学生进度。

## 当前阶段：MVP 完善 + 部署上线

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

### 进行中
- [ ] 部署到 Vercel（拿到线上地址）

### 待做
- [ ] 账号系统 + 跨设备进度同步（Supabase 或类似方案）
- [ ] 小程序适配（Taro/Uni-app 或 H5 WebView）
- [ ] 更多互动元素（短视频嵌入、实验动画等）

## 技术栈
- 前端：Vite + React 19 + TypeScript + TailwindCSS 4
- 状态：React hooks + localStorage
- 数据：src/data/quizData.ts（静态 JSON）
- 构建产物：dist/（可直接部署）

## 关键文件
| 文件 | 用途 |
|------|------|
| src/App.tsx | 主入口，连线所有组件 |
| src/data/quizData.ts | 题目数据（8章51个知识点） |
| src/types.ts | 类型定义 + 等级/XP 常量 |
| src/hooks/useGameState.ts | 游戏状态管理（localStorage） |
| src/components/SkillTree.tsx | 技能树主组件 |
| src/components/QuizModal.tsx | 答题弹窗 |
| src/components/StatusBar.tsx | 顶部等级/XP 状态栏 |
| 讲义/ | 老师上传的讲义文件（用于补充题目） |

## 部署目标
- Vercel 免费版，自动从 git 部署
- 域名：待定

## 更新日志
- 2026-05-08：新增ch8八下期中复习专章（21知识点42题，从4套一模卷提取）
- 2026-05-07：MVP 完成，7章30知识点，build 通过
- 2026-05-07：创建项目状态文件，规划下一步（补题+部署）

## 数据源
- `八下复习/` — 4套期中模拟卷（学生版+答案版）+ 知识清单
- `八下复习/extracted/` — pdftotext提取的文本（中间文件）
- `一模卷子/` — 2024/2025各区一模卷（后续可补充更多题目）
