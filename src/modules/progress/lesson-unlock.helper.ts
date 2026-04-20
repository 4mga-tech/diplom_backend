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
  completedLessonIds,
  unlockedLessonIds,
}: {
  courseId: string;
  lessonId: string;
  completedLessonIds: string[];
  unlockedLessonIds: string[];
}) => {
  const units = await findUnitsByCourseId(courseId);
  const lessons = await getOrderedLessonsForCourse(courseId);
  const currentLesson = lessons.find((lesson) => lesson.id === lessonId);

  if (!currentLesson) {
    return null;
  }

  const lessonsInUnit = lessons.filter((lesson) => lesson.unitId === currentLesson.unitId);
  const currentLessonIndex = lessonsInUnit.findIndex((lesson) => lesson.id === lessonId);
  const nextLessonInUnit = lessonsInUnit[currentLessonIndex + 1];

  if (nextLessonInUnit) {
    if (!unlockedLessonIds.includes(nextLessonInUnit.id)) {
      unlockedLessonIds.push(nextLessonInUnit.id);
      return { id: nextLessonInUnit.id, title: nextLessonInUnit.title };
    }

    return null;
  }

  const currentUnitCompleted = lessonsInUnit.every((lesson) =>
    completedLessonIds.includes(lesson.id),
  );

  if (!currentUnitCompleted) {
    return null;
  }

  const currentUnit = units.find((unit) => unit.id === currentLesson.unitId);
  const nextUnit = units.find((unit) => unit.order === (currentUnit?.order ?? 0) + 1);
  if (!nextUnit) {
    return null;
  }

  const firstLessonInNextUnit = lessons.find((lesson) => lesson.unitId === nextUnit.id);
  if (!firstLessonInNextUnit) {
    return null;
  }

  if (!unlockedLessonIds.includes(firstLessonInNextUnit.id)) {
    unlockedLessonIds.push(firstLessonInNextUnit.id);
    return { id: firstLessonInNextUnit.id, title: firstLessonInNextUnit.title };
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
