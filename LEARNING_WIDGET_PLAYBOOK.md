# 🎓 初中化学游戏化互动实验室开发手册 (Learning Widget Playbook)

本手册总结并沉淀了**九年级化学（沪教版大纲）**游戏化学习模式的深度交互、微观可视化与探究式教学的开发规范。未来在设计**「水的电解」**、**「酸碱盐导电与中和」**、**「气体的实验室制取」**等后续章节的交互实验室时，请严格复制并遵循本手册的设计哲学与代码模板。

---

## 🎨 一、 核心设计哲学 (Core Philosophies)

### 1. 探索式“盲盒心流”循环 (The Blind-box Heart-flow Loop)
拒绝直接剧透与说教，让学生通过“主动尝试 ➡️ 动画直观呈现后果 ➡️ 诊断评分 ➡️ 原理解释”形成心流闭环。
*   **不剧透原则**：在最初的配置/选择阶段，不标注任何温变、冷热、正确或错误的文字/Emoji。
*   **空载初始态 (Zero State)**：在用户点击“确定执行”前，右侧所有的 SVG 动画容器（天平、量筒、烧杯、仪器导管）必须是空置、零刻度或绝对静止的，保留悬念。
*   **错误动作的视觉惩罚 (Visual Punishment of Error)**：如果学生算错数据、选错方法（如仰视、游码反置），绝不通过弹窗文字生硬拦截，而是**让动画直接模拟出错误的物理后果**（天平倾斜、水倒多了、视线发生红色偏折折射等），让学生在视觉反馈中“爽快地犯错并吸取教训”。

### 2. 中考高频“物理联觉”模型 (Midterm Exam Physics Linkage)
交互的实验装置不应是随意的动画，必须高度提炼自**初中中考、一模二模卷子中的高频压轴探究题模型**。
*   将化学溶解的微观温变，与物理的**空气热胀冷缩、压强变化**进行联觉绑定。
*   采用经典的**【双装置联动并排】**设计：**U型管红墨水压强计** + **密闭导管红气球**，使虚拟实验直接转化为考试提分战斗力。

### 3. 分层教学与“超纲折叠” (Differentiated Instruction & Shading)
*   **大纲对照组 (Control Group) 的刚性存在**：在探究吸热（硝酸铵）与放热（氢氧化钠）时，**氯化钠 (NaCl) 作为“常温空白对照组”必须保留**。中考极易考查对照组的目的，必须在原理解析中作为黄金提分点予以点明。
*   **超纲知识卡片折叠**：涉及高中热力学（扩散与水合能量变化、电离晶格能等）的深层本质，绝对不要堆砌在主界面上。应设计一个霓虹微光的“💡 拓展卡片”气泡/小圈，点击后弹出 Modal 对话框，并在最上方醒目标注 **`(该内容本阶段不要求掌握)`**，满足学有余力学生的分层拔高。

### 4. 无遮挡精细排版 (Zero-Overlap Precision Layout)
*   卡片高度响应式适配。
*   数值指标、当前温度、诊断提示等文本，必须采用独立的、位于上方或下方的非重叠半透明玻璃容器，**绝对禁止压在量筒水面、天平托盘等 SVG 精密动画上**。

---

## 💻 二、 核心 React 状态管理模板 (State Engine Template)

一个标准的互动实验室组件通常包含以下五个核心生命周期状态：

```tsx
// 1. 步骤控制 (Step Control)
const [step, setStep] = useState<1 | 2 | 3 | 4>(1); 

// 2. 盲盒输入与选择 (Blind inputs)
const [soluteKey, setSoluteKey] = useState<string>('nacl');
const [inputSoluteMass, setInputSoluteMass] = useState<string>('');
const [inputWaterVol, setInputWaterVol] = useState<string>('');
const [balanceMode, setBalanceMode] = useState<'normal' | 'reversed'>('normal'); // 左物右码 vs 右物左码
const [eyeAngle, setEyeAngle] = useState<'normal' | 'up' | 'down'>('normal');     // 平视、仰视、俯视

// 3. 执行确认开关 (The Reveal Switch)
const [hasConfirmedMeasurements, setHasConfirmedMeasurements] = useState<boolean>(false);

// 4. 搅拌与化学反应演变 (Reaction Progress Engine)
const [isStirring, setIsStirring] = useState<boolean>(false);
const [stirProgress, setStirProgress] = useState<number>(0); // 0 到 100
const [currentTemp, setCurrentTemp] = useState<number>(25);  // 动态温度值
```

### ⏳ 搅拌演变与平滑温变 Effect 模板

通过 React `useEffect` 配合线性差值，实现搅拌过程中溶解进度平滑增加、温度逼近设定终值的丝滑物理过渡：

```typescript
useEffect(() => {
  if (step === 3 && isStirring) {
    const interval = setInterval(() => {
      setStirProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsStirring(false);
          return 100;
        }
        return prev + 2.5; // 进度增长速率
      });

      setCurrentTemp((prev) => {
        const targetTemp = soluteOptions[soluteKey].finalTemp;
        const diff = targetTemp - prev;
        if (Math.abs(diff) < 0.5) return targetTemp;
        return prev + diff * 0.08; // 逼近阻尼，实现牛顿冷却定律平滑曲线
      });
    }, 50);
    return () => clearInterval(interval);
  }
}, [step, isStirring, soluteKey]);
```

---

## 📐 三、 经典 SVG 物理动画计算公式

在 SVG 视轨内，利用 `stirProgress` (0~100) 配合 `soluteKey` 计算动态的 CSS 平移或缩放属性，这是保障交互视觉“Premium（高端）”的生命线。

### 1. U型管红墨水液面差位移公式 (`shift`)

U型管左侧与右侧的液面互为相反数。
*   **吸热**：左侧上升（`shift` 变负），右侧下降。
*   **放热**：左侧下降（`shift` 变正），右侧上升。

```typescript
const shift = soluteKey === 'exothermic' 
  ? (stirProgress / 100) * 15      // 放热最大位移 15px
  : soluteKey === 'endothermic'
    ? - (stirProgress / 100) * 15  // 吸热最大回吸位移 -15px
    : 0;                           // 对照组不移动

const leftY = 70 + shift;          // 左侧液面 y 坐标
const rightY = 70 - shift;         // 右侧液面 y 坐标
```

### 2. 密闭气球 3D 热胀冷缩缩放公式 (`scaleX`, `scaleY`)

使用 `scale` 比单纯增加半径 `r` 更具自然张力。同时，**纵向缩放比横向缩放略多**，可以生动模拟气球收缩瘪掉时的“瘫软”感：

```typescript
const balloonScaleX = soluteKey === 'exothermic' 
  ? 1 + (stirProgress / 100) * 0.40          // 膨胀至 1.4x
  : soluteKey === 'endothermic'
    ? Math.max(0.35, 1 - (stirProgress / 100) * 0.75) // 极度瘪缩至 0.25x 并保持最小体积
    : 1.0;

const balloonScaleY = soluteKey === 'exothermic' 
  ? 1 + (stirProgress / 100) * 0.45          // 纵向膨胀更多，呈长椭圆
  : soluteKey === 'endothermic'
    ? Math.max(0.30, 1 - (stirProgress / 100) * 0.80) // 瘫软瘪下，纵向更矮
    : 1.0;
```

---

## 🔮 四、 后续章节核心交互方案蓝图 (Future Blueprints)

您可以直接将这套工作流复制到以下三个极具代表性的新模块中：

### 1. 🌊 水的电解与微观示意图实验室 (Electrolysis of Water)

*   **步骤 1：闭合开关**
    *   **盲盒动作**：选择直流电源正负极接法（正接、反接）、加入辅助导电稀硫酸/氢氧化钠浓度。
    *   **盲盒态**：确认闭合开关前，两只收集试管均充满水，零气泡。
    *   **动画后果**：点击“通电”后，电极产生气泡。根据正负极接法，若正接，左管气体：右管气体为 1:2；若反接，比例对调；若导电介质没加，气泡产生极慢甚至不动。
*   **步骤 2：气体纯度检验（爆鸣实验）**
    *   **物理联觉**：火星木条和燃着木条伸入试管。氢气管触发“尖锐的爆鸣声”（若不纯）或“噗”的声音；氧气管触发“木条复燃”。
*   **步骤 3：微观粒子拆分联动**
    *   **双图联动**：左侧电解宏观管，右侧并排展示**【水分子分裂水合模型】**与**【氢氧分子重组动画】**。

### 2. 🧪 酸碱盐中和反应与电导性实验 (Neutralization & Conductivity)

*   **步骤 1：溶液混合滴定**
    *   **盲盒动作**：向盛有未知溶液的烧杯中滴加酚酞/石蕊，手动拖拽胶头滴管滴加酸或碱。
    *   **盲盒态**：混合前指示剂颜色不剧透，烧杯上方无酸碱度线。
    *   **动画后果**：滴加过程中，随着搅拌，液体颜色渐变（红色 ➡️ 刚好无色 ➡️ 蓝色）。若滴加过量，液体呈现极端的指示剂颜色。
*   **步骤 2：电导率与离子变迁双图联动**
    *   **装置一：灯泡亮度计**。灯泡亮度直接跟烧杯中**自由移动的离子浓度**挂钩（中和滴定到恰好完全反应点，对于弱酸弱碱中和，灯泡会“变暗至熄灭”，然后过量后再“重新变亮”）。
    *   **装置二：微观离子消亡图**。显示 $H^+$ 与 $OH^-$ 实时碰撞重组为 $H_2O$ 稳定分子的微观动态。

### 3. 🎈 实验室制取二氧化碳与收集实验室 (CO2 Preparation & Collection)

*   **步骤 1：发生装置组装**
    *   **盲盒动作**：选择反应物组合（块状大理石+稀盐酸、碳酸钠粉末+稀盐酸、大理石+稀硫酸）。选择漏斗类型（长颈漏斗 vs 分液漏斗）。
    *   **动画后果**：
        *   若用碳酸钠：反应瞬间极快，直接爆表喷出；
        *   若用稀硫酸：反应一会儿后，因为生成微溶的 $CaSO_4$ 阻碍反应，气泡很快“慢慢停止”；
        *   若长颈漏斗没插入液面以下：气体直接从斗口“扑哧扑哧”漏掉，收集瓶内无气泡。
*   **步骤 2：收集与验满双图联动**
    *   **装置一：向上排空气法收集瓶**。二氧化碳气体（半透明灰色粒子）缓缓在瓶底堆积并向上推挤空气。
    *   **装置二：燃着木条验满仪**。木条移到瓶口，若气体收集满，木条瞬间熄灭。若漏气，木条持续燃烧。

---

## 📝 五、 开发自查清单 (Developer Checklist)

在提交任何新关卡或交互组件之前，请务必检查以下五条“军规”：

1.  [ ] **是否有文字碰撞**：在大屏、中屏、小屏移动端模拟下，量取、读数和所有的解析标签是否均无重叠，是否保留了足够的上部留白？
2.  [ ] **是否保留了空白对照**：如果是探究性质的实验，是否包含并重点突出了 `nacl` 或 `water` 的空白对照组及其在中考中的特殊意义？
3.  [ ] **选项是否有剧透**：步骤 1 的溶质选择/化学试剂选择卡片上，是否**100% 抹除**了“吸热/放热/剧烈反应/无现象”等温变和剧透字样？
4.  [ ] **是否有零初始态过渡**：未确认前天平游码砝码是否隐藏？量筒水柱是否为 0？气球是否处于 1.0 基准态？
5.  [ ] **拓展卡片是否隔离**：高中超纲的微观机制（如热力学水合扩散等）是否被独立收纳到霓虹小卡片中，并醒目标注了限时阶段不掌握的警告？

---

*本手册已作为核心范式沉淀进项目数据库，在后续章节的学习模块交互重构中，请随时查阅并完美套用此设计哲学。*
