import { Router } from 'express';
import DocumentController from '../controllers/document.controller';
import Authentication from '../middleware/authentication';
import { ADMIN, USER } from "../config/permission";
import { uploadDOCResource, saveDocResourceWithHashCheck } from '../utils/upload';
const documentRoute = Router();
/**
 * @openapi
 * /documents:
 *   get:
 *     summary: Lấy danh sách tài liệu
 *     tags:
 *       - Document
 *     responses:
 *       200:
 *         description: Danh sách tài liệu
 *       500:
 *         description: Lỗi server
 */
documentRoute.get('/', DocumentController.getAll);

//search và filter
/**
 * @openapi
 * /documents/create:
 *   post:
 *     summary: Tạo tài liệu mới (yêu cầu admin)
 *     tags:
 *       - Document
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề của tài liệu
 *                 example: "Tài liệu Vật lý"
 *               link:
 *                 type: string
 *                 description: Đường dẫn tới tài liệu (PDF, DOCX, v.v.)
 *                 example: "https://example.com/document.pdf"
 *               topic_id:
 *                 type: integer
 *                 description: ID chủ đề mà tài liệu thuộc về
 *                 example: 1
 *     responses:
 *       201:
 *         description: Tạo tài liệu thành công
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 *       500:
 *         description: Lỗi server
 */
documentRoute.post(
        '/create',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        saveDocResourceWithHashCheck,  // multer + hash check + lưu file
        DocumentController.create       // req.savedFile đã có thông tin file
);


/**
 * @openapi
 * /documents/update/{id}:
 *   patch:
 *     summary: Cập nhật thông tin tài liệu (yêu cầu admin)
 *     tags:
 *       - Document
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của tài liệu cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Tài liệu Vật lý cập nhật"
 *               link:
 *                 type: string
 *                 example: "https://example.com/updated.pdf"
 *               topic_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       202:
 *         description: Cập nhật tài liệu thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy tài liệu
 *       500:
 *         description: Lỗi server
 */
documentRoute.patch('/update/:id',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        DocumentController.update);


/**
 * @openapi
 * /documents/remove/{id}:
 *   delete:
 *     summary: Xóa một tài liệu theo ID (yêu cầu admin)
 *     tags:
 *       - Document
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của tài liệu cần xóa
 *     responses:
 *       204:
 *         description: Xóa tài liệu thành công
 *       404:
 *         description: Không tìm thấy tài liệu
 *       500:
 *         description: Lỗi server
 */
documentRoute.delete('/remove/:id',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        DocumentController.remove);

/**
 * @openapi
 * /documents/setAvailable/{id}:
 *   patch:
 *     summary: Thay đổi trạng thái tài liệu theo ID (yêu cầu admin)
 *     tags:
 *       - Document
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của tài liệu cần Thay đổi trạng thái
 *     responses:
 *       204:
 *         description: Thay đổi trạng thái tài liệu thành công
 *       404:
 *         description: Không tìm thấy tài liệu
 *       500:
 *         description: Lỗi server
 */
documentRoute.patch('/setAvailable/:id',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        DocumentController.setAvailable);

export default documentRoute;
