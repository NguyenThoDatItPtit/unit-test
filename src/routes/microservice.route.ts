import { Router } from "express";
import  Authentication  from "../middleware/authentication"
import MicroserviceController from "../controllers/microservice.controller";
import { uploadDOC } from '../utils/upload';
import { ADMIN } from "../config/permission";

const microserviceRoute = Router();

/**
 * @openapi
 * /microservice/llm/ask:
 *   post:
 *     summary: Hỏi LLM RAG
 *     tags:
 *       - LLM
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *            
 *             properties:
 *               question:
 *                 type: string
 *                 example: "Trong điều kiện chuẩn về nhiệt độ và áp suất thì"
 *     responses:
 *       200:
 *         description: Trả về câu trả lời từ LLM
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                     answer:
 *                       type: string
 *                     sources:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           file_name:
 *                             type: string
 *                           file_path:
 *                             type: string
 *                           score:
 *                             type: number
 *                           preview:
 *                             type: string
 *       400:
 *         description: Request không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */

microserviceRoute.post(
    "/llm/ask",
    Authentication.AuthenticateToken,
    MicroserviceController.askLLM
);


/**
 * @openapi
 * /microservice/llm/vectorize:
 *   post:
 *     summary: Vectorize tài liệu cho RAG
 *     tags: [LLM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [files]
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [document_id, file_path]
 *                   properties:
 *                     document_id:
 *                       type: integer
 *                       example: 36
 *                     file_path:
 *                       type: string
 *                       example: "/resources/docx_file/36_Thpt-Cumgar.docx"
 *     responses:
 *       200:
 *         description: Vectorize started
 *       202:
 *         description: Vectorize job accepted
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

microserviceRoute.post(
    "/llm/vectorize",
    // Authentication.AuthenticateToken,
    MicroserviceController.vectorize
);


/**
 * @openapi
 * /bert/process-docx/:filename :
 *   post:
 *     summary: Xử lý tài liệu (DOCX) cho BERT
 *     tags:
 *       - BERT
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - file_paths
 *             properties:
 *               file_paths:
 *                 type: array
 *                 description: Danh sách đường dẫn file trên server để vector hóa
 *                 items:
 *                   type: string
 *                   example: "/resources/docx_file/36_Thpt-Cumgar.docx"
 *     responses:
 *       200:
 *         description: Vectorize thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Vectorization completed
 *                 data:
 *                   type: object
 *                   nullable: true
 *       202:
 *         description: Job vectorize đã được nhận (xử lý async)
 *       400:
 *         description: Request không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */

microserviceRoute.post("/bert/process-docx/:filename",
  Authentication.AuthenticateToken,
  Authentication.AuthorizeRoles(...ADMIN),
  uploadDOC.single("file"),
  MicroserviceController.process_docx
);

export default microserviceRoute;

