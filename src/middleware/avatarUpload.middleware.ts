import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import type { AuthRequest } from "./auth.middleware";

const AVATAR_DIR = path.resolve(process.cwd(), "uploads", "avatars");
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

fs.mkdirSync(AVATAR_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATAR_DIR);
  },
  filename: (req, file, cb) => {
    const authReq = req as AuthRequest;
    const extension = path.extname(file.originalname) || ".bin";
    const safeExtension = extension.replace(/[^.\w]/g, "").toLowerCase() || ".bin";
    const userId = authReq.userId ?? "anonymous";

    cb(null, `${userId}-${Date.now()}${safeExtension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_AVATAR_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, WEBP, and GIF images are allowed"));
      return;
    }

    cb(null, true);
  },
});

export const avatarUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload.single("avatar")(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "Avatar image must be 5 MB or smaller" });
      return;
    }

    if (err instanceof MulterError) {
      res.status(400).json({ message: err.message });
      return;
    }

    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
      return;
    }

    res.status(400).json({ message: "Avatar upload failed" });
  });
};
