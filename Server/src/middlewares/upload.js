import fs from "fs";
import path from "path";
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const uploadDir = path.resolve("uploads", "receipts");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`);
  },
});

export const receiptUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new ApiError(400, "Receipt must be a PNG, JPG, JPEG, or PDF file"));
    }
    return cb(null, true);
  },
});
