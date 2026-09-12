# CLAUDE.md — AI 开发参考

## 项目概述
初中化学游戏化刷题 Web 应用（沪教版），面向中国大陆学生。教师创建邀请码，学生注册后通过技能树闯关解锁知识点。已部署腾讯云 CloudBase。

## 技术栈
- **前端**: Vite 8 + React 19 + TypeScript 6 + TailwindCSS 4
- **运行时**: Bun（`bun run build`, `bun install`）
- **后端**: CloudBase 云函数（Node.js 18），数据库 NoSQL
- **音效**: Web Audio API 合成音（无外部音频文件）
- **彩带**: canvas-confetti

## 项目结构

```
src/
├── App.tsx                    # 主入口，路由状态机（landing/login/modeSelect/skillTree/reviewMode/report）
├── types.ts                   # 所有类型：Challenge, BigQuestion, KnowledgePoint, Chapter, PlayerState, StudentProfile
├── data/quizData.ts           # 全部题目（skillTreeChapters + reviewChapters）
├── hooks/
│   ├── useGameState.ts        # 核心状态管理（localStorage + 云端同步 + 数据迁移）
│   └── useSound.ts            # Web Audio 音效
├── components/
│   ├── SkillTree.tsx          # 技能树（章节折叠、节点状态、跳章按钮）
│   ├── QuizModal.tsx          # 答题弹窗（普通题 + 大题 BigQuestion）
│   ├── StatusBar.tsx          # 顶部状态栏（XP/等级/连胜/吉祥物）
│   ├── BottomNav.tsx          # 底部导航栏
│   ├── WrongBook.tsx          # 错题本（原位重做+彩带+音效）
│   ├── LearningReport.tsx     # 学习报告（章节进度/薄弱点/错题分布）
│   ├── Leaderboard.tsx        # 排行榜（领奖台+列表）
│   ├── ForumBoard.tsx         # 论坛（发帖+回复）
│   ├── InviteGate.tsx         # 登录/注册（邀请码+学号+密码）
│   ├── JumpChapterModal.tsx   # 跳章测试
│   ├── UnlockChallengeModal.tsx # 跳关挑战
│   ├── ProfileEditor.tsx      # 头像/昵称编辑
│   ├── LandingPage.tsx        # 首页
│   ├── ModeSelect.tsx         # 模式选择
│   ├── ReviewMode.tsx         # 期末复习
│   └── Mascot.tsx             # 吉祥物图片组件
├── services/
│   ├── cloudSync.ts           # 云端API（cloudRegister/cloudLogin/cloudSyncProgress）
│   ├── forum.ts               # 论坛API
│   ├── leaderboard.ts         # 排行榜API
│   ├── loginGuard.ts          # 登录限流
│   └── questionFeedback.ts    # 题目反馈
cloudfunctions/
├── studentLogin/index.js      # ⚠️ 核心：注册/登录逻辑
├── syncProgress/index.js      # ⚠️ 核心：进度同步（含防旧数据覆盖）
├── leaderboard/index.js       # 排行榜查询
├── forum/index.js             # 论坛CRUD
├── validateClassCode/         # 班级码校验
└── manageCodes/               # 邀请码管理
```

## 关键数据模型

```ts
// 题目
interface Challenge { stem, options[], answer(0-based), explanation }
interface BigQuestion { context, subQuestions: Challenge[] }

// 知识点
interface KnowledgePoint { id, topic, difficulty(1-3), prerequisites?, challenges[], bigQuestion? }

// 章节树: Chapter → Section[] → KnowledgePoint[]
interface Chapter { id, name, icon, sections: Section[] }

// 学生状态（localStorage + 云端同步）
interface PlayerState { xp, level, streak, maxStreak, completedNodes[], unlockedNodes[], nodeStates{}, achievements[], wrongList[] }

// 学生档案（localStorage + 云端 students 集合）
interface StudentProfile { profileId, classCode, className, studentName, studentId, displayName?, avatar?, createdAt }
```

## 云端数据库

| 集合 | 关键字段 | 说明 |
|------|------|------|
| `students` | classCode, studentId, studentName, displayName, password, avatar | 学生账号 |
| `progress` | studentKey(`${classCode}:${studentId}`), state(PlayerState) | 游戏进度 |
| `invitations` | code, active, maxUses, usedCount, className | 邀请码 |
| `forum_posts` | content, author, createdAt, replies[] | 论坛帖子 |
| `messages` | content, author, createdAt | 留言（旧） |

## 部署

```bash
# 环境 ID: xdkchem-d1g3f4ibw03b1b776
# URL: https://xdkchem-d1g3f4ibw03b1b776-1372708082.tcloudbaseapp.com
# 云函数 BASE: https://xdkchem-d1g3f4ibw03b1b776-1372708082.ap-shanghai.app.tcloudbase.com

# 前端部署
bun run build
tcb hosting deploy dist/ -e xdkchem-d1g3f4ibw03b1b776

# 云函数部署
tcb fn deploy <name> --dir cloudfunctions/<name> --force -e xdkchem-d1g3f4ibw03b1b776

# 新云函数首次需创建 HTTP 入口
tcb service create -p <name> -f <name> -e xdkchem-d1g3f4ibw03b1b776

# 数据库操作
tcb db nosql execute -e xdkchem-d1g3f4ibw03b1b776 -c '<json>'
```

## 重要注意事项

### ⚠️ 数据安全（最高优先级）
- **永远不要丢失学生进度数据**
- `migrateState()` 在加载时自动补全缺失字段，修改 PlayerState 结构时需更新 `DATA_VERSION`
- 登录时 `signInProfile` 会合并云端和本地进度，取完成节点数更多的
- 云端 `syncProgress` 不接受节点数更少的覆盖（防旧设备覆盖新数据）
- `profileId` 和 `studentKey` 格式为 `${classCode}:${studentId}`，**不能改动此格式**

### 邀请码逻辑
- 注册消耗名额（usedCount+1），登录不消耗
- 云函数 `studentLogin` 通过 `action: 'register'|'login'` 区分

### 部署注意
- 环境变量 `VITE_CLOUD_FUNCTION_BASE` 在 `.env` 中配置
- 新增云函数后需在 `cloudbaserc.json` 注册 + 部署 + 创建 HTTP 入口（`tcb service create`）
- CloudBase CLI 登录可能过期，报错时执行 `tcb login`

### 题目添加
- `src/data/quizData.ts` 是唯一题目源
- 大题用 `bigQuestion: { context, subQuestions }` 字段
- 知识点 prerequisites 为 `string[]`，必须匹配现有节点 id
- 节点 id 格式：`ch{章号}-n{节点号}`（如 ch1-n3）
- 章节 id 格式：`ch{章号}-s{节号}`（如 ch2-s1）

### 音效
- Web Audio API 合成，无外部文件
- 移动端 AudioContext 初始 suspended，`ensureCtx()` 在每次播放前 resume
- `useSound` hook 返回 `{ playCorrect, playWrong, playLevelUp, playComplete }`

## 💡 学习模式与交互设计准则 (重要工作记录)
- **高频考试联动模型**: 优先选择中考/一模高频出镜、贴合真实试卷物理联动的实验模型（例如：将溶解温变与密闭瓶气压/U型管红墨水高度差结合，或量筒读数仰视/俯视光线偏折）。这样能帮助学生将交互体验与试卷题目直接关联。
- **超纲知识折叠 (知识小卡片)**: 避免在核心学习路径中堆砌高中或超纲的深层学术原理解释（例如：溶解的微观热力学扩散与水合过程）。对于想深挖的不同层次学生，应将其折叠进一个小的微光“💡 知识卡片”气泡/圈内，点击弹出 Modal/对话框，并醒目标注 **`(该内容本阶段不要求掌握)`**，确保不增加普通学生的认知负担。
- **无遮挡精细排版**: 交互中的实时数据、刻度、文字（如仰视俯视的视线偏折文字说明）应采用独立的、位于上方或下方的非重叠半透明面板展示，绝对避免文字与动态组件（如量筒刻度、液面、天平托盘）重叠。
- **禁止剧透**: 探索类交互（如溶解热效应）不要在初始选药罐上就剧透吸放热状态，将结果保留在第三步实际操作时由学生亲自动手实验和观察。

