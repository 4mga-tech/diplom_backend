import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/user/user.route";
import { healthRouter } from "./routes/health.route";
import contentRoutes from "./modules/content/content.route";
import progressRoutes from "./modules/progress/progress.route";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/progress", progressRoutes);

export default app;