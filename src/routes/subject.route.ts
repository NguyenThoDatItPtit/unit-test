import { Router } from "express";
import SubjectController from "../controllers/subject.controller";
import Authentication from "../middleware/authentication";
import {ADMIN} from "../config/permission";

const subjectRoute = Router();

/**
 * @openapi
 * /subjects:
 *   get:
 *     summary: Lấy danh sách môn học
 *     tags:
 *       - Subject
 *     responses:
 *       200:
 *         description: Danh sách môn học
 *       500:
 *         description: Lỗi server
 */
subjectRoute.get('/', SubjectController.getAll);

/**
 * @openapi
 * /subjects/create:
 *   post:
 *     summary: Tạo môn học mới (yêu cầu admin)
 *     tags:
 *       - Subject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject_name:
 *                 type: string
 *                 example: "Vật lý"
 *     responses:
 *       201:
 *         description: Tạo môn học thành công
 *       500:
 *         description: Lỗi server
 */
subjectRoute.post('/create',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        SubjectController.create);

/**
 * @openapi
 * /subjects/update/{id}:
 *   patch:
 *     summary: Cập nhật thông tin môn học (yêu cầu admin)
 *     tags:
 *       - Subject
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của môn học cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject_name:
 *                 type: string
 *                 example: "Toán"
 *     responses:
 *       202:
 *         description: Cập nhật môn học thành công
 *       404:
 *         description: Không tìm thấy môn học
 *       500:
 *         description: Lỗi server
 */
subjectRoute.patch('/update/:id',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        SubjectController.update);

/**
 * @openapi
 * /subjects/remove/{id}:
 *   delete:
 *     summary: Xóa một subject theo ID (yêu cầu admin)
 *     tags:
 *       - Subject
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của môn học cần xóa
 *     responses:
 *       204:
 *         description: Xóa môn học thành công
 *       404:
 *         description: Không tìm thấy môn học
 *       500:
 *         description: Lỗi server
 */
subjectRoute.delete('/remove/:id',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        SubjectController.remove);

/**
 * @openapi
 * /subjects/setAvailable/{id}:
 *   patch:
 *     summary: Ẩn một subject theo ID (yêu cầu admin)
 *     tags:
 *       - Subject
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của môn học cần ẩn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               available:
 *                 type: boolean
 *     responses:
 *       204:
 *         description: Xóa môn học thành công
 *       404:
 *         description: Không tìm thấy subject
 *       500:
 *         description: Lỗi server
 */
subjectRoute.patch('/setAvailable/:id',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        SubjectController.setAvailable);

export default subjectRoute;

