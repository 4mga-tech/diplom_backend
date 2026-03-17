import { connectDB } from "../config/db";
import { env } from "../config/env";

import { Level } from "../modules/content/level.model";
import { Package } from "../modules/content/package.model";
import { Lesson } from "../modules/content/lesson.model";
import { v4 as uuidv4 } from "uuid";
async function seed() {
  await connectDB(env.MONGODB_URI);

  console.log("🧹 Cleaning database...");

  await Promise.all([
    Level.deleteMany({}),
    Package.deleteMany({}),
    Lesson.deleteMany({}),
  ]);

  console.log("📚 Creating Levels...");

  const levels = await Level.insertMany([
    {
      levelNumber: 0,
      title: "beginner A0",
      description: "beginner basic",
      order: 1,
    },
    {
      levelNumber: 1,
      title: "first A1",
      description: "verify ur basic",
      order: 2,
    },
  ]);

  const [a0, a1] = levels;

  console.log("📦 Creating Units...");

  const units = await Package.insertMany([
    {
      levelId: a0._id,
      title: "Мэндчилгээ ба ёс",
      category: "speech",
      order: 1,
    },
    {
      levelId: a0._id,
      title: "Танилцах",
      category: "speech",
      order: 2,
    },
    {
      levelId: a1._id,
      title: "Нэр үг",
      category: "noun",
      order: 1,
    },
  ]);

  const [a0u1, a0u2, a1u1] = units;

  console.log("🎓 Creating Lessons...");

  await Lesson.insertMany([
    {
      packageId: a0u1._id,
      lessonId: uuidv4(),
      title: "Мэндчилгээ",
      subtitle: "Сайн байна уу",
      type: "vocabulary",
      content: {
        words: [
          { mongolian: "Сайн байна уу", english: "Hello" },
          { mongolian: "Сайн уу", english: "Hi" },
        ],
      },
      order: 1,
      xp: 10,
    },
    {
      packageId: a0u1._id,
      lessonId: uuidv4(),
      title: "Талархал",
      subtitle: "Баярлалаа",
      type: "vocabulary",
      content: {
        words: [
          { mongolian: "Баярлалаа", english: "Thank you" },
          { mongolian: "Их баярлалаа", english: "Thank you very much" },
        ],
      },
      order: 2,
      xp: 10,
    },
    {
      packageId: a0u1._id,
      lessonId: uuidv4(),
      title: "Уучлал",
      subtitle: "Уучлаарай",
      type: "vocabulary",
      content: {
        words: [
          { mongolian: "Уучлаарай", english: "Sorry" },
          { mongolian: "Өршөөгөөрэй", english: "Excuse me" },
        ],
      },
      order: 3,
      xp: 10,
    },

    {
      packageId: a0u2._id,
      lessonId: uuidv4(),
      title: "Нэр хэлэх",
      subtitle: "Миний нэр...",
      type: "grammar",
      content: {
        explanation: "Өөрийгөө танилцуулах бүтэц",
        examples: ["Миний нэр Бат.", "Би Болд гэдэг."],
      },
      order: 1,
      xp: 10,
    },
    {
      packageId: a0u2._id,
      lessonId: uuidv4(),
      title: "Хаанаас ирсэн",
      subtitle: "Би ...-аас",
      type: "grammar",
      content: {
        explanation: "Гарал үүсэл илэрхийлэх",
        examples: ["Би Улаанбаатараас.", "Би Солонгосоос ирсэн."],
      },
      order: 2,
      xp: 12,
    },

    {
      packageId: a1u1._id,
      lessonId: uuidv4(),
      title: "Нэр үг I",
      subtitle: "юм/нь",
      type: "quiz",
      content: {
        question: "‘Ном’ гэдэг нь ямар үг вэ?",
        options: ["Нэр үг", "Үйл үг", "Тэмдэг нэр"],
        correctAnswer: 0,
      },
      order: 1,
      xp: 12,
    },
  ]);
  console.log("✅ Seed success!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed not successfully:", e);
  process.exit(1);
});
