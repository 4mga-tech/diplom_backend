import {
  findLessonById,
  findLessonsByUnitIds,
  findUnitsByCourseId,
} from "../learning/learning.repository";

export const getOrderedLessonsForCourse = async (courseId: string) => {
  const units = await findUnitsByCourseId(courseId);
  const unitIds = units.map((unit) => unit.id);
  const lessons = await findLessonsByUnitIds(unitIds);

  const unitOrder = new Map(units.map((unit) => [unit.id, unit.order]));

  return lessons.sort((a, b) => {
    const unitCompare = (unitOrder.get(a.unitId) ?? 0) - (unitOrder.get(b.unitId) ?? 0);
    if (unitCompare !== 0) {
      return unitCompare;
    }
    return a.order - b.order;
  });
};

export const getFirstLessonIdForCourse = async (courseId: string) => {
  const lessons = await getOrderedLessonsForCourse(courseId);
  return lessons[0]?.id ?? null;
};

export const unlockNextLesson = async ({
  courseId,
  lessonId,
  unlockedLessonIds,
}: {
  courseId: string;
  lessonId: string;
  unlockedLessonIds: string[];
}) => {
  const lessons = await getOrderedLessonsForCourse(courseId);
  const currentIndex = lessons.findIndex((lesson) => lesson.id === lessonId);

  if (currentIndex < 0) {
    return null;
  }

  const nextLesson = lessons[currentIndex + 1];
  if (!nextLesson) {
    return null;
  }

  if (!unlockedLessonIds.includes(nextLesson.id)) {
    unlockedLessonIds.push(nextLesson.id);
    return { id: nextLesson.id, title: nextLesson.title };
  }

  return null;
};

export const ensureLessonBelongsToCourse = async (courseId: string, lessonId: string) => {
  const lesson = await findLessonById(lessonId);
  if (!lesson) {
    return false;
  }

  const orderedLessons = await getOrderedLessonsForCourse(courseId);
  return orderedLessons.some((item) => item.id === lessonId);
};
