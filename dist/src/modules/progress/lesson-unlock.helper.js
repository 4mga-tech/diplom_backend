"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureLessonBelongsToCourse = exports.unlockNextLesson = exports.getFirstLessonIdForCourse = exports.getOrderedLessonsForCourse = void 0;
const learning_repository_1 = require("../learning/learning.repository");
const getOrderedLessonsForCourse = async (courseId) => {
    const units = await (0, learning_repository_1.findUnitsByCourseId)(courseId);
    const unitIds = units.map((unit) => unit.id);
    const lessons = await (0, learning_repository_1.findLessonsByUnitIds)(unitIds);
    const unitOrder = new Map(units.map((unit) => [unit.id, unit.order]));
    return lessons.sort((a, b) => {
        const unitCompare = (unitOrder.get(a.unitId) ?? 0) - (unitOrder.get(b.unitId) ?? 0);
        if (unitCompare !== 0) {
            return unitCompare;
        }
        return a.order - b.order;
    });
};
exports.getOrderedLessonsForCourse = getOrderedLessonsForCourse;
const getFirstLessonIdForCourse = async (courseId) => {
    const lessons = await (0, exports.getOrderedLessonsForCourse)(courseId);
    return lessons[0]?.id ?? null;
};
exports.getFirstLessonIdForCourse = getFirstLessonIdForCourse;
const unlockNextLesson = async ({ courseId, lessonId, unlockedLessonIds, }) => {
    const lessons = await (0, exports.getOrderedLessonsForCourse)(courseId);
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
exports.unlockNextLesson = unlockNextLesson;
const ensureLessonBelongsToCourse = async (courseId, lessonId) => {
    const lesson = await (0, learning_repository_1.findLessonById)(lessonId);
    if (!lesson) {
        return false;
    }
    const orderedLessons = await (0, exports.getOrderedLessonsForCourse)(courseId);
    return orderedLessons.some((item) => item.id === lessonId);
};
exports.ensureLessonBelongsToCourse = ensureLessonBelongsToCourse;
