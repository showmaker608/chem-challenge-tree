import type { Course } from '../types';
import { DEFAULT_COURSE_ID } from './courseConstants';
import { countCourseNodes } from './courseUtils';
import { withG9SummerTopicPacks } from './g9SummerTopicPacks';
import { withJuniorHandoutBoosts } from './juniorHandoutCourse';
import { withCompleteJuniorLearningModes } from './learningModeEnhancements';
import { reviewChapters, skillTreeChapters } from './quizData';

export const publishedCourses: Course[] = [
  {
    id: DEFAULT_COURSE_ID,
    name: '上海初中化学',
    shortName: '上海中考化学',
    region: '上海',
    stage: 'junior',
    examSystem: '上海中考',
    textbook: '沪教版初中化学',
    description: '沪教版初中化学 · 上海中考导向 · 游戏化闯关刷题',
    modeSummary: '从物质变化到酸碱盐，循序渐进',
    gradeOrder: ['八年级', '九年级'],
    chapters: withCompleteJuniorLearningModes(withG9SummerTopicPacks(withJuniorHandoutBoosts(skillTreeChapters))),
    reviewChapters,
  },
];

export const draftCourses: Course[] = [];

export const courses: Course[] = [
  ...publishedCourses,
  ...draftCourses,
];

export const defaultCourse = publishedCourses.find(course => course.id === DEFAULT_COURSE_ID) ?? publishedCourses[0];

export function findCourseById(courseId: string | null, options: { includeDrafts?: boolean } = {}) {
  if (!courseId) return undefined;
  const source = options.includeDrafts ? courses : publishedCourses;
  return source.find(course => course.id === courseId);
}

export { DEFAULT_COURSE_ID, countCourseNodes };
