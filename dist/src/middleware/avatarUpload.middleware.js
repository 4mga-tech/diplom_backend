"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarUploadMiddleware = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const multer_2 = require("multer");
const AVATAR_DIR = node_path_1.default.resolve(process.cwd(), "uploads", "avatars");
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);
node_fs_1.default.mkdirSync(AVATAR_DIR, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, AVATAR_DIR);
    },
    filename: (req, file, cb) => {
        const authReq = req;
        const extension = node_path_1.default.extname(file.originalname) || ".bin";
        const safeExtension = extension.replace(/[^.\w]/g, "").toLowerCase() || ".bin";
        const userId = authReq.userId ?? "anonymous";
        cb(null, `${userId}-${Date.now()}${safeExtension}`);
    },
});
const upload = (0, multer_1.default)({
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
const avatarUploadMiddleware = (req, res, next) => {
    upload.single("avatar")(req, res, (err) => {
        if (!err) {
            next();
            return;
        }
        if (err instanceof multer_2.MulterError && err.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({ message: "Avatar image must be 5 MB or smaller" });
            return;
        }
        if (err instanceof multer_2.MulterError) {
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
exports.avatarUploadMiddleware = avatarUploadMiddleware;
