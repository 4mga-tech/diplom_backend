import mongoose from "mongoose";

const LessonContentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    lessonId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: [
        "video",
        "text",
        "quiz",
        "audio",
        "pronunciation",
        "image",
        "alphabet_table",
        "classification",
        "grammar_note",
        "vocab_list",
        "exercise_repeat",
        "exercise_write",
        "exercise_fill",
        "exercise_word_build",
        "quiz_link",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

LessonContentSchema.index({ lessonId: 1, order: 1 }, { unique: true });

export const LessonContent = mongoose.model(
  "LessonContent",
  LessonContentSchema,
);
