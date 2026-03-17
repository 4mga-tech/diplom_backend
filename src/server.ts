import mongoose from "mongoose";
import app from "./app";
import { env } from "./config/env";

mongoose.connect(env.MONGODB_URI).then(() => {
  console.log("MongoDB connected");

  app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${env.PORT}`);
  });
});
