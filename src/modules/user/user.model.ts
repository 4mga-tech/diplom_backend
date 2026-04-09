import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { required, string } from "joi";
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: { type: String, required: true },

    passwordHash: {
      type: String,
      required: true,
    },
    nativeLanguage: {
      type: String,
      default: "en",
    },
    uiLanguage: {
      type: String,
      default: "en",
    },
    streak: { type: Number, default: 0 },
    totalXP: { type: Number, default: 0 },
  },
  { timestamps: true },
);

UserSchema.methods.comparePassword = async function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

export const User = mongoose.model("User", UserSchema);
