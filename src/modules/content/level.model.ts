// import mongoose from "mongoose";

// const LevelSchema = new mongoose.Schema(
//   {
//     levelNumber: {
//       type: Number,
//       required: true,
//       unique: true,
//     },
//     title: { type: String, required: true },
//     description: { type: String },
//     order: { type: Number, default: 0 },
//   },
//   { timestamps: true },
// );

// LevelSchema.index({ order: 1 });

// export const Level = mongoose.model("Level", LevelSchema);

import mongoose from "mongoose";

const LevelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, 
    title: String,
    subtitle: String,
    description: String,
    vocabularyReady: Boolean,
    vocabularyCount: Number,
    order: Number,
    gradient: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length === 2,
        message: "gradient must contain exactly 2 colors",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Level", LevelSchema);