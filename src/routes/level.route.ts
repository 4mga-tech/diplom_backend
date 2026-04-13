import express from "express";
import Level from "../modules/content/level.model";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const levels = await Level.find().sort({ order: 1 });
    res.json(levels);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch levels" });
  }
});

export default router;