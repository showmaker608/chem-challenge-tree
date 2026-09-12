import type { Course } from '../types';

export function countCourseNodes(course: Course) {
  return course.chapters.reduce(
    (sum, chapter) => sum + chapter.sections.reduce((sectionSum, section) => sectionSum + section.nodes.length, 0),
    0,
  );
}
