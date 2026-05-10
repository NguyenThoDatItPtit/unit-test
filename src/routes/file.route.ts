import { Router } from "express";
import { FileController } from "../controllers/file.controller";
import { uploadImage, uploadDOC } from "../utils/upload";
import Authentication from "../middleware/authentication";
import { ADMIN } from "../config/permission";


const router = Router();

router.get("/json", FileController.getAllJson);

router.get("/json/:filename", FileController.getJsonById);

router.post("/images/info",FileController.getImagesInfo);

// stream ảnh (FE đọc được)
router.get(
  "/images/signed/:filename",
  Authentication.AuthenticateToken,
  FileController.getSignedImageUrl
);

router.get(
  "/images/:filename",
  FileController.verifyImageSignature,
  FileController.streamImage
);

// upload ảnh (hash – không trùng)
router.post(
  "/images/upload",
  uploadImage.array("images", 10),
  FileController.uploadImages
)


export default router;
