import { defaultCourse } from '../src/data/courses';
import { getLearningModeProfile, MASTERY_THRESHOLD } from '../src/data/learningMode';

const targetGrades = ['八年级', '九年级'];
const failures: string[] = [];

for (const grade of targetGrades) {
  const nodes = defaultCourse.chapters
    .filter((chapter) => chapter.grade === grade)
    .flatMap((chapter) => chapter.sections.flatMap((section) => section.nodes));

  for (const node of nodes) {
    const learning = node.learningContent;
    if (!learning) {
      failures.push(`${grade} ${node.id} ${node.topic}：没有学习入口`);
      continue;
    }
    if (!learning.example) failures.push(`${grade} ${node.id} ${node.topic}：没有前测题`);
    if (!learning.tips.length) failures.push(`${grade} ${node.id} ${node.topic}：没有针对性点拨`);

    const questions = node.bigQuestion?.subQuestions ?? node.challenges;
    const transferQuestions = questions.filter((question) => question.stem !== learning.example.stem);
    const hasGuidedLesson = Boolean(learning.guidedSteps?.length) && learning.interactiveWidgetMode !== 'gated';
    const minimumTransferCount = hasGuidedLesson ? 1 : 2;
    if (transferQuestions.length < minimumTransferCount) {
      failures.push(`${grade} ${node.id} ${node.topic}：学后练习/迁移题不足`);
    }

    const profile = getLearningModeProfile(node);
    if (!profile.goal || !profile.misconceptionTag) {
      failures.push(`${grade} ${node.id} ${node.topic}：缺学习目标或错因标签`);
    }
  }

  const pathTypes = [...new Set(nodes.map((node) => getLearningModeProfile(node).pathType))];
  console.log(`${grade}：${nodes.length}/${nodes.length} 个节点通过 · ${pathTypes.join(' / ')}`);
}

if (MASTERY_THRESHOLD !== 80) failures.push(`掌握线异常：${MASTERY_THRESHOLD}`);

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`掌握线：${MASTERY_THRESHOLD} 分 · 学习模式审计通过`);
}
