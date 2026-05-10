import { Router } from "express";
import TopicController from "../controllers/topic.controller";
import Authentication from "../middleware/authentication";
import {ADMIN} from "../config/permission";

const topicRoute = Router();

/**
 * @openapi
 * /topics:
 *   get:
 *     summary: Lấy danh sách tất cả chủ đề (cần đăng nhập)
 *     tags:
 *       - Topic
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách chủ đề
 *       500:
 *         description: Lỗi server
 */
topicRoute.get(
  '/',
  TopicController.getAll
);

/**
 * @openapi
 * /topics/create:
 *   post:
 *     summary: Tạo chủ đề mới (chỉ admin)
 *     tags:
 *       - Topic
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Chủ đề 1"
 *               description:
 *                 type: string
 *                 example: "Chủ đề về ngữ pháp tiếng Anh"
 *               subject_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Tạo chủ đề thành công
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
topicRoute.post(
  '/create',
  Authentication.AuthenticateToken,
  Authentication.AuthorizeRoles(...ADMIN), 
  TopicController.create
);

/**
 * @openapi
 * /topics/update/{id}:
 *   patch:
 *     summary: Cập nhật thông tin chủ đề (chỉ admin)
 *     tags:
 *       - Topic
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của chủ đề cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Chủ đề cập nhật"
 *               description:
 *                 type: string
 *                 example: "Nội dung đã cập nhật"
 *               subject_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       202:
 *         description: Cập nhật chủ đề thành công
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy chủ đề
 *       500:
 *         description: Lỗi server
 */
topicRoute.patch(
  '/update/:id',
  Authentication.AuthenticateToken,
  Authentication.AuthorizeRoles(...ADMIN), // chỉ admin được sửa
  TopicController.update
);

/**
 * @openapi
 * /topics/remove/{id}:
 *   delete:
 *     summary: Xóa một chủ đề theo ID (chỉ admin)
 *     tags:
 *       - Topic
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của chủ đề cần xóa
 *     responses:
 *       204:
 *         description: Xóa chủ đề thành công
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy chủ đề
 *       500:
 *         description: Lỗi server
 */
topicRoute.delete(
  '/remove/:id',
  Authentication.AuthenticateToken,
  Authentication.AuthorizeRoles(...ADMIN), // chỉ admin được xóa
  TopicController.remove
);

export default topicRoute;
