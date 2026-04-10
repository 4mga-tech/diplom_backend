import { connectDB } from "../config/db";
import { env } from "../config/env";
import { Course } from "../modules/learning/course.model";
import { Unit } from "../modules/learning/unit.model";
import { LearningLesson } from "../modules/learning/lesson.model";
import { LessonContent } from "../modules/learning/lesson-content.model";
import { Quiz } from "../modules/learning/quiz.model";
import { QuizQuestion } from "../modules/learning/quiz-question.model";
import { DailyReview } from "../modules/review/daily-review.model";
import { UserProgress } from "../modules/progress/user-progress.model";
import { QuizAttempt } from "../modules/progress/quiz-attempt.model";
import { XpLedger } from "../modules/progress/xp-ledger.model";

async function seed() {
  await connectDB(env.MONGODB_URI);

  console.log("Cleaning learning collections...");

  await Promise.all([
    Course.deleteMany({}),
    Unit.deleteMany({}),
    LearningLesson.deleteMany({}),
    LessonContent.deleteMany({}),
    Quiz.deleteMany({}),
    QuizQuestion.deleteMany({}),
    DailyReview.deleteMany({}),
    UserProgress.deleteMany({}),
    QuizAttempt.deleteMany({}),
    XpLedger.deleteMany({}),
  ]);

  console.log("Creating courses and units...");

  await Course.insertMany([
    { id: "m1", title: "M1 Foundations" },
    { id: "m2", title: "M2 Everyday Communication" },
  ]);

  await Unit.insertMany([
    { id: "m1-u1", courseId: "m1", title: "Unit 1: Greetings", order: 1 },
    { id: "m2-u1", courseId: "m2", title: "Unit 1: Travel Basics", order: 1 },
  ]);

  console.log("Creating lessons...");

  await LearningLesson.insertMany([
    {
      id: "m1-u1-l1",
      unitId: "m1-u1",
      title: "Basic Greetings",
      subtitle: "Say hello and respond politely",
      order: 1,
      xpReward: 20,
      quizXpReward: 10,
    },
    {
      id: "m2-u1-l1",
      unitId: "m2-u1",
      title: "Travel Vocabulary",
      subtitle: "Useful words for stations, tickets, and directions",
      order: 1,
      xpReward: 30,
      quizXpReward: 18,
    },
    {
      id: "m2-u1-l2",
      unitId: "m2-u1",
      title: "Daily Routine Phrases",
      subtitle: "Simple phrases for plans, timing, and errands",
      order: 2,
      xpReward: 35,
      quizXpReward: 0,
    },
    {
      id: "m2-u1-l3",
      unitId: "m2-u1",
      title: "Asking for Help",
      subtitle: "Questions and polite requests for support",
      order: 3,
      xpReward: 40,
      quizXpReward: 0,
    },
  ]);

  console.log("Creating lesson content...");

  await LessonContent.insertMany([
    {
      id: "m1-u1-l1-c1",
      lessonId: "m1-u1-l1",
      type: "text",
      title: "Greeting overview",
      order: 1,
      content: {
        text: "Start with simple greetings like Sain baina uu? and short replies like Sain, bayarlalaa.",
      },
    },
    {
      id: "m2-u1-l1-c1",
      lessonId: "m2-u1-l1",
      type: "text",
      title: "Overview",
      order: 1,
      content: {
        text: "Learn travel vocabulary for stations, tickets, platforms, directions, and asking where to go next.",
      },
    },
    {
      id: "m2-u1-l1-c2",
      lessonId: "m2-u1-l1",
      type: "video",
      title: "Platform conversation",
      order: 2,
      content: {
        url: "https://example.com/videos/m2-u1-l1.mp4",
        durationSeconds: 94,
      },
    },
    {
      id: "m2-u1-l1-c3",
      lessonId: "m2-u1-l1",
      type: "quiz",
      title: "Lesson Quiz",
      order: 3,
      content: {
        quizId: "quiz_m2_u1_l1",
      },
    },
    {
      id: "m2-u1-l2-c1",
      lessonId: "m2-u1-l2",
      type: "text",
      title: "Routine phrases",
      order: 1,
      content: {
        text: "Practice expressions for waking up, going out, buying food, and asking about time.",
      },
    },
    {
      id: "m2-u1-l3-c1",
      lessonId: "m2-u1-l3",
      type: "text",
      title: "Polite requests",
      order: 1,
      content: {
        text: "Use direct but polite help-seeking phrases in stations, shops, and public places.",
      },
    },
  ]);

  console.log("Creating quiz...");

  await Quiz.create({
    id: "quiz_m2_u1_l1",
    lessonId: "m2-u1-l1",
    title: "Travel Vocabulary Quiz",
    passingScore: 70,
  });

  await QuizQuestion.insertMany([
    {
      id: "quiz_m2_u1_l1_q1",
      quizId: "quiz_m2_u1_l1",
      type: "multiple_choice",
      prompt: "What is the best meaning of ticket counter?",
      helper: "Choose the travel-related meaning.",
      options: ["Platform", "Ticket desk", "Bus stop", "Crosswalk"],
      correctAnswer: "Ticket desk",
      explanation: "A ticket counter is the place where tickets are sold.",
      xpReward: 3,
      order: 1,
    },
    {
      id: "quiz_m2_u1_l1_q2",
      quizId: "quiz_m2_u1_l1",
      type: "true_false",
      prompt: "Platform means the area where passengers wait to board a train.",
      helper: "Decide whether the statement is correct.",
      options: ["true", "false"],
      correctAnswer: true,
      explanation: "Platform is the boarding area for rail passengers.",
      xpReward: 3,
      order: 2,
    },
    {
      id: "quiz_m2_u1_l1_q3",
      quizId: "quiz_m2_u1_l1",
      type: "translation",
      prompt: "Translate to English: Bayarlalaa.",
      helper: "Use the most common translation.",
      options: [],
      correctAnswer: "thank you",
      explanation: "Bayarlalaa is the standard expression for thank you.",
      xpReward: 3,
      order: 3,
    },
    {
      id: "quiz_m2_u1_l1_q4",
      quizId: "quiz_m2_u1_l1",
      type: "multiple_choice",
      prompt: "Which phrase best fits when asking where the train leaves from?",
      helper: "Pick the most useful travel question.",
      options: [
        "Where is the platform?",
        "How old are you?",
        "What is your hobby?",
        "Do you like coffee?",
      ],
      correctAnswer: "Where is the platform?",
      explanation: "It directly asks for the departure location.",
      xpReward: 3,
      order: 4,
    },
    {
      id: "quiz_m2_u1_l1_q5",
      quizId: "quiz_m2_u1_l1",
      type: "translation",
      prompt: "Translate to English: Zam.",
      helper: "This word is often used in directions.",
      options: [],
      correctAnswer: "road",
      explanation: "Zam commonly means road or route.",
      xpReward: 3,
      order: 5,
    },
    {
      id: "quiz_m2_u1_l1_q6",
      quizId: "quiz_m2_u1_l1",
      type: "multiple_choice",
      prompt: "Which word is most closely related to directions?",
      helper: "Pick the navigation term.",
      options: ["Left", "Bread", "Window", "Teacher"],
      correctAnswer: "Left",
      explanation: "Left is a direction word used when navigating.",
      xpReward: 3,
      order: 6,
    },
  ]);

  console.log("Creating daily review...");

  await DailyReview.create({
    reviewId: "daily_review_2026_04_09",
    dateKey: "2026-04-09",
    title: "Today's Review",
    questions: [
      {
        id: "review_q1",
        type: "multiple_choice",
        prompt: "What is the best English meaning of Bayarlalaa?",
        helper: "Choose the closest translation.",
        options: ["Thank you", "Goodbye", "Please", "Maybe"],
        correctAnswer: "Thank you",
        explanation: "Bayarlalaa is the standard way to say thank you.",
        xpReward: 8,
        order: 1,
      },
      {
        id: "review_q2",
        type: "true_false",
        prompt: "Sain baina uu? is a greeting.",
        helper: "Mark true or false.",
        options: ["true", "false"],
        correctAnswer: true,
        explanation: "It is a common greeting similar to hello.",
        xpReward: 6,
        order: 2,
      },
      {
        id: "review_q3",
        type: "translation",
        prompt: "Translate to English: Uuchlaarai.",
        helper: "Use the most natural short translation.",
        options: [],
        correctAnswer: "sorry",
        explanation: "Uuchlaarai is commonly used to apologize.",
        xpReward: 7,
        order: 3,
      },
      {
        id: "review_q4",
        type: "multiple_choice",
        prompt: "Which phrase best helps you ask for directions?",
        helper: "Pick the option that asks where something is.",
        options: ["Where is it?", "I am hungry.", "See you tomorrow.", "That is expensive."],
        correctAnswer: "Where is it?",
        explanation: "It is the only option that asks for location.",
        xpReward: 5,
        order: 4,
      },
      {
        id: "review_q5",
        type: "true_false",
        prompt: "Platform is related to train travel.",
        helper: "Decide if the statement is correct.",
        options: ["true", "false"],
        correctAnswer: true,
        explanation: "A platform is where passengers board trains.",
        xpReward: 3,
        order: 5,
      },
      {
        id: "review_q6",
        type: "translation",
        prompt: "Translate to English: Nom.",
        helper: "Think about common beginner vocabulary.",
        options: [],
        correctAnswer: "book",
        explanation: "Nom means book.",
        xpReward: 3,
        order: 6,
      },
    ],
  });

  console.log("Seed success");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
