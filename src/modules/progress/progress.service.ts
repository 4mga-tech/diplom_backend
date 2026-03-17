import { Progress } from "./progress.model";
import { Lesson } from "../content/lesson.model";
import { Package } from "../content/package.model";
import { User } from "../user/user.model";

export const completeLesson = async (
  userId: string,
  lessonId: string,
  score: number,
) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new Error("Lesson not found");

  const progress = await Progress.findOneAndUpdate(
    { userId, lessonId },
    { completed: true, score },
    { upsert: true, new: true },
  );

  await User.findByIdAndUpdate(userId, {
    $inc: { totalXP: score },
  });
  return progress;
};
export const getLevelProgress = async (
  userId: string,
  levelId: string
) => {
  const packages = await Package.find({ levelId });

  const packageIds = packages.map(p => p._id);

  const lessons = await Lesson.find({
    packageId: { $in: packageIds },
  });

  const lessonIds = lessons.map(l => l._id);

  const completedCount = await Progress.countDocuments({
    userId,
    lessonId: { $in: lessonIds },
    completed: true,
  });

  const total = lessonIds.length;

  const percentage = total === 0
    ? 0
    : Math.round((completedCount / total) * 100);

  const unlocked = percentage >= 80;

  return {
    totalLessons: total,
    completedLessons: completedCount,
    percentage,
    unlocked,
  };
};
