import express from "express";
import cors from "cors";
import levelRouter from "./routes/level.route";
import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/user/user.route";
import { healthRouter } from "./routes/health.route";
import contentRoutes from "./modules/content/content.route";
import progressRoutes from "./modules/progress/progress.route";
import lessonRoutes from "./modules/lessons/lesson.route";
import quizRoutes from "./modules/quiz/quiz.route";
import reviewRoutes from "./modules/review/review.route";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/levels", levelRouter);
app.use("/health", healthRouter);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api", progressRoutes);
app.use("/api", lessonRoutes);
app.use("/api", quizRoutes);
app.use("/api", reviewRoutes);

export default app;
