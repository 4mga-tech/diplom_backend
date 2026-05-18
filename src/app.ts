import express from "express";
import cors from "cors";
import path from "node:path";
import levelRouter from "./routes/level.route";
import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/user/user.route";
import { healthRouter } from "./routes/health.route";
import contentRoutes from "./modules/content/content.route";
import progressRoutes from "./modules/progress/progress.route";
import lessonRoutes from "./modules/lessons/lesson.route";
import quizRoutes from "./modules/quiz/quiz.route";
import reviewRoutes from "./modules/review/review.route";
import testRoutes from "./modules/tests/test.route";
import leaderboardRoutes from "./modules/leaderboard/leaderboard.route";
import gameRoutes from "./modules/games/game.route";
import practiceRoutes from "./modules/practice/practice.route";
const app = express();
const uploadsDir = path.resolve(process.cwd(), "uploads");

app.use(cors());
app.use("/uploads", express.static(uploadsDir));
app.use(express.json());
app.use("/levels", levelRouter);
app.use("/health", healthRouter);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/me", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api", progressRoutes);
app.use("/api", lessonRoutes);
app.use("/api", quizRoutes);
app.use("/api", reviewRoutes);
app.use("/api/tests", testRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/api", practiceRoutes);
app.use("/api", gameRoutes);
app.use(
  "/audio",
  express.static(path.join(process.cwd(), "uploads/audio"))
);
export default app;
