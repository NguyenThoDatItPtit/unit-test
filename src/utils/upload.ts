import multer from "multer";
import path from "path";
import fs from "fs";
import { sanitizeFilename } from "./helper";

import crypto from "crypto";

/* =========================
 * PATH CONFIG
 * ========================= */
const docDataDir     = path.join(__dirname, "../../data/uploads/docx");
export const imageOutputDir = path.join(__dirname, "../../data/outputs/media");
const docDirResource = path.join(__dirname, "../../resources/docx_file");
const pdfDirResource = path.join(__dirname, "../../resources/pdf_file");

/* =========================
 * INIT FOLDERS
 * ========================= */
[docDataDir, docDirResource, pdfDirResource, imageOutputDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/* =========================
 * DOC STORAGE
 * ========================= */
const docStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, docDataDir),
  filename: (_req, file, cb) => {
    cb(null, sanitizeFilename(file.originalname));
  },
});

/* =========================
 * DOC RESOURCE STORAGE
 * ========================= */
export const docResourceStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext === ".pdf") {
      return cb(null, pdfDirResource);
    }

    // mặc định docx
    cb(null, docDirResource);
  },

  filename: (_req, file, cb) => {
    cb(null, sanitizeFilename(file.originalname));
  },
});


/* =========================
 * DOC RESOURCE UPLOAD WITH HASH CHECK
 * ========================= */

// Map lưu hash để check duplicate (có thể thay bằng DB)
// Memory storage để multer đọc file vào buffer
const memoryStorage = multer.memoryStorage();

// Middleware upload + hash check + lưu file theo hash
export const saveDocResourceWithHashCheck = (req: any, res: any, next: any) => {
  const upload = multer({ storage: memoryStorage }).single("file");

  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "File không tồn tại" });

    try {
      const fileBuffer = req.file.buffer;
      const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

      // Chọn folder theo extension
      const ext = path.extname(req.file.originalname).toLowerCase();
      const folder = ext === ".pdf" ? pdfDirResource : docDirResource;

      // Tên file = hash + extension
      const filename = `${hash}${ext}`;
      const filePath = path.join(folder, filename);

      // Kiểm tra nếu file đã tồn tại trên disk
      if (fs.existsSync(filePath)) {
        return res.status(409).json({ error: "File đã tồn tại" });
      }

      // Lưu file vào disk
      await fs.promises.writeFile(filePath, fileBuffer);

      // Gán req.file để controller dùng bình thường
      req.file = {
        filename,           // tên file trên disk (hash + ext)
        path: filePath,     // đường dẫn đầy đủ
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };

      next();
    } catch (error: any) {
      console.error("Lưu file thất bại:", error);
      return res.status(500).json({ error: "Lưu file thất bại" });
    }
  });
};

/* =========================
 * FILE FILTERS
 * ========================= */
const docFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExt = [".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file DOC hoặc DOCX"));
  }
};

const docResourceFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExt = [".docx", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file DOCX hoặc PDF"));
  }
};

/* =========================
 * IMAGE UPLOAD (DEDUP BY HASH)
 * ========================= */
const imageStorage = multer.memoryStorage();

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback 
  ) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ cho phép upload ảnh images"));
    }
    cb(null, true);
  },
});

/* =========================
 * EXPORT UPLOADERS
 * ========================= */
export const uploadDOC = multer({
  storage: docStorage,
  fileFilter: docFilter,
});

export const uploadDOCResource = multer({
  storage: docResourceStorage,
  fileFilter: docResourceFilter,
});
