# 化学知识挑战树 — 项目状态

## 愿景
教培老师做初中化学游戏化刷题产品，让学生通过闯关解锁的方式对化学产生兴趣。面向中国大陆初中生（沪教版），已部署腾讯云 CloudBase。

## 当前阶段：推广使用 + 持续迭代

### 已完成

**核心玩法**
- [x] 技能树可视化（9章72+知识点，章节折叠、锁定/可用/完成三态、脉冲动画）
- [x] 答题弹窗（选择题、答对彩带+Duolingo风格音效、答错显示解析）
- [x] 综合大题（共享场景+逐子题作答）：技能树4道 + 复习区5道
- [x] XP/等级系统（Lv1化学小白 → Lv10元素之主，连胜奖励XP+10）
- [x] Duolingo风格跳章测试（答对70%一键解锁整章）
- [x] 跳关挑战（锁定的节点可通过前置测试解锁，每次随机出题不重复）
- [x] 吉祥物情绪动画（idle/happy/sad/fire/wow，webp压缩至20KB）
- [x] 答题二次挑战提示（🔄 第N次挑战）

**辅助功能**
- [x] 错题本（按知识点分组折叠、原地重做、做对彩带+音效）
- [x] 学习报告（章节进度、薄弱知识点Top5、错题分布）
- [x] 排行榜（全服XP排行，前三名领奖台，只显示昵称不显真名）
- [x] 论坛（发帖+回复，显示学生昵称）
- [x] 头像系统（25个头像可选，支持emoji+图片）
- [x] 双模式：知识树闯关 + 期末复习（自由选题）
- [x] 底部导航栏（知识树/排行/问答/错题/报告，错题红点角标）

**账号系统**
- [x] 邀请码 + 学号 + 密码注册，同一邀请码+学号+密码跨设备登录
- [x] 邀请码仅注册时消耗名额（20次），登录不消耗
- [x] 本地记住登录状态（关闭浏览器不用重登）
- [x] 云端进度同步（自动合并本地/云端，取多的；云端拒绝旧数据覆盖）
- [x] 数据版本迁移机制（DATA_VERSION，自动补全缺失字段）
- [x] 登录限流（1分钟5次失败锁定）

**题库**
- [x] 72知识点、380+题（全部选择题）
- [x] 技能树9章 + 期末复习专题
- [x] 从4套期中模拟卷 + 名校试题汇编提取实验题
- [x] 知识点 prerequisites 显式前置依赖

**部署**
- [x] 腾讯云 CloudBase 静态托管 + 云函数（6个）
- [x] 网站：https://xdkchem-d1g3f4ibw03b1b776-1372708082.tcloudbaseapp.com
- [x] 邀请码：CHEM莲花/新闸/曹杨/七宝（4个校区各20人）

### 待做
- [ ] 教师看板：按班级查看学生完成率、错题分布
- [ ] 每日任务/挑战（跨章节随机推送，提升DAU）
- [ ] 成就徽章系统（十连胜、全章满分等）
- [ ] PWA 离线支持
- [ ] 更多题目（九上内容）
- [ ] 小程序适配

## 技术栈
- 前端：Vite + React 19 + TypeScript + TailwindCSS 4
- 音效：Web Audio API 合成（triangle波 Duolingo风格）
- 彩带：canvas-confetti
- 状态：React hooks + localStorage（按 profileId 分桶）+ CloudBase 云端同步
- 后端：CloudBase 云函数（Node.js 18）
- 数据库：CloudBase NoSQL（collections: students, progress, invitations, forum_posts, messages）
- 构建：bun run build（tsc + vite）→ dist/
- 部署：tcb fn deploy + tcb hosting deploy

## 部署命令
```bash
# 前端
bun run build
tcb hosting deploy dist/ -e xdkchem-d1g3f4ibw03b1b776

# 云函数
tcb fn deploy <name> --dir cloudfunctions/<name> --force -e xdkchem-d1g3f4ibw03b1b776

# 新云函数需创建 HTTP 入口
tcb service create -p <name> -f <name> -e xdkchem-d1g3f4ibw03b1b776
```

## 更新日志
- 2026-05-17：排行榜全服跨班、底部导航栏重构、新头像（8个）、排行榜性能优化（批量查询替代逐个查询）
- 2026-05-16：用户系统重构（邀请码仅注册消耗+学号密码登录）、记住登录状态、跨设备进度合并、数据版本迁移机制、云端防旧数据覆盖
- 2026-05-15：论坛功能、留言板、HTTP服务配置修复
- 2026-05-14：填空题全转选择题、答对彩带、错题本原地重做+音效、燃料燃烧/金属材料新章、实验汇编提取、综合大题、多次挑战提示、AudioContext修复
- 2026-05-10：登录限流、题目反馈、CloudBase云函数
- 2026-05-08：八下期中复习专章
- 2026-05-07：MVP完成
