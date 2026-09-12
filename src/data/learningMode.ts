import type { KnowledgePoint } from '../types';

export const MASTERY_THRESHOLD = 80;

export type LearningPathType =
  | '判断辨析'
  | '现象证据'
  | '实验决策'
  | '微粒建模'
  | '规则推导'
  | '定量计算'
  | '综合证据链';

export interface LearningModeProfile {
  pathType: LearningPathType;
  goal: string;
  misconceptionTag: string;
}

/**
 * 学习模式不是按关卡统一套模板，而是先按认知任务分流。
 * 这里覆盖八、九年级主线；题目若自带错因标签，则优先使用题目标签。
 */
export function getLearningModeProfile(node: KnowledgePoint): LearningModeProfile {
  const topic = node.topic;

  if (node.bigQuestion || /综合/.test(topic)) {
    const misconceptionTag = /氧气/.test(topic)
      ? '氧气性质、制取操作与实验目的未形成证据链'
      : /电解水|水的综合/.test(topic)
        ? '正负极、气体检验与宏微观表述混淆'
        : /碳的氧化物|CO₂|CO/.test(topic)
          ? 'CO 与 CO₂ 的鉴别、除杂或安全边界混淆'
          : /金属/.test(topic)
            ? '反应现象与金属活动性比较链不完整'
            : '长情境信息未拆分或证据链不完整';
    return {
      pathType: '综合证据链',
      goal: '能拆分长情境，逐问匹配证据、规律和结论，再检查前后是否一致。',
      misconceptionTag,
    };
  }

  if (/pH|酸碱度/i.test(topic)) {
    return {
      pathType: '实验决策',
      goal: '能按规范完成 pH 测定，并根据读数作出有边界的判断。',
      misconceptionTag: 'pH 试纸操作或读数判断不规范',
    };
  }
  if (/酸|碱|中和|指示剂/.test(topic)) {
    return {
      pathType: /实验|中和/.test(topic) ? '现象证据' : '判断辨析',
      goal: '能区分物质类别与溶液性质，并用现象或反应证据支持结论。',
      misconceptionTag: '酸碱类别与酸碱性混淆',
    };
  }
  if (/饱和|溶解度|溶液|结晶/.test(topic)) {
    return {
      pathType: /曲线|计算|质量分数/.test(topic) ? '定量计算' : '判断辨析',
      goal: '能先锁定温度、溶剂和溶质，再判断溶解状态或完成定量关系。',
      misconceptionTag: '饱和溶液、浓溶液与溶解度概念混淆',
    };
  }
  if (/计算|质量分数|方程式|守恒|化学式计算|数据处理/.test(topic)) {
    return {
      pathType: '定量计算',
      goal: '能把文字条件转成守恒关系或比例关系，并检查单位与结果合理性。',
      misconceptionTag: /方程式/.test(topic) ? '化学式、配平或反应条件书写不完整' : '数量关系或单位对应错误',
    };
  }
  if (/分子|原子|离子|电子|微粒|结构|元素|化学符号|化合价/.test(topic)) {
    return {
      pathType: '微粒建模',
      goal: '能在宏观物质、微观粒子和化学符号之间正确转换。',
      misconceptionTag: /元素/.test(topic) ? '宏观组成与微观构成混淆' : '粒子层级或符号含义混淆',
    };
  }
  if (/制取|实验|操作|仪器|量筒|净化|提纯|过滤|蒸发|电解|配制|气密性|探究/.test(topic)) {
    return {
      pathType: '实验决策',
      goal: '能根据实验目的选择装置与步骤，并用安全、污染和误差解释选择。',
      misconceptionTag: '实验装置、操作顺序与目的不匹配',
    };
  }
  if (/氧气/.test(topic)) {
    return {
      pathType: /性质/.test(topic) ? '现象证据' : '综合证据链',
      goal: '能区分现象、结论与实验目的，并迁移到制取、检验和安全操作。',
      misconceptionTag: '氧气的助燃性与可燃性混淆',
    };
  }
  if (/一氧化碳|二氧化碳|碳的氧化物|CO₂|CO/.test(topic)) {
    return {
      pathType: '现象证据',
      goal: '能依据反应现象和安全边界鉴别、检验或除去碳的氧化物。',
      misconceptionTag: 'CO 与 CO₂ 的性质、检验或除杂方法混淆',
    };
  }
  if (/金属活动性|金属.*反应|置换/.test(topic)) {
    return {
      pathType: /实验|综合/.test(topic) ? '综合证据链' : '规则推导',
      goal: '能把反应现象转成活动性证据，并判断实验方案能否形成完整比较链。',
      misconceptionTag: '反应现象与金属活动性结论脱节',
    };
  }
  if (/性质|燃烧|灭火|反应|鉴别|空气|水/.test(topic)) {
    return {
      pathType: '现象证据',
      goal: '能从可观察现象出发，判断变化或性质，并说明证据与结论的对应关系。',
      misconceptionTag: '把实验现象、物质性质和结论混为一谈',
    };
  }
  if (/分类|概念|变化|纯净物|混合物|能源|材料/.test(topic)) {
    return {
      pathType: '判断辨析',
      goal: '能先说出判断标准，再用正反例检验概念边界。',
      misconceptionTag: '判断标准不统一或概念边界混淆',
    };
  }
  return {
    pathType: '规则推导',
    goal: '能先独立判断，再把结论压缩成可迁移的规则并用于新题。',
    misconceptionTag: '只记结论，未建立可迁移的判断规则',
  };
}

export function getChallengeMisconceptionTag(node: KnowledgePoint, challengeTag?: string) {
  return challengeTag ?? getLearningModeProfile(node).misconceptionTag;
}
