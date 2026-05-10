import { Router } from 'express';
import BankController from '../controllers/bank.controller';
import Authentication from '../middleware/authentication';
import { ADMIN, USER } from "../config/permission";
import { BankQuestionController } from '../controllers/bank.question.controller';

const bankRoute = Router();

/**
 * @openapi
 * /banks:
 *   get:
 *     summary: Lấy danh sách ngân hàng câu hỏi
 *     tags: [Banks]
 *     responses:
 *       200:
 *         description: Danh sách đề thi
 *       500:
 *         description: Lỗi server
 */
bankRoute.get('/', BankController.list);

bankRoute.get("/user/bank-history",
        Authentication.AuthenticateToken,
        BankController.getUserBankHistory);
bankRoute.post("/submit",
        Authentication.AuthenticateToken,
        BankController.submit
)
bankRoute.get("/user-answer",
        Authentication.AuthenticateToken,
        BankController.getUserAnswer
)

/**
 * @openapi
 * /banks/{id}:
 *   get:
 *     summary: Lấy thông tin câu hỏi theo ID ngân hàng
 *     tags: [Banks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách đề thi
 *       500:
 *         description: Lỗi server
 */
bankRoute.get('/:id', Authentication.AuthenticateToken, BankController.getById);
bankRoute.get('/:id/questions', Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        BankController.getQuestionIdBank
)
/**
 * @openapi
 * /banks/create:
 *   post:
 *     summary: Tạo ngân hàng câu hỏi mới (yêu cầu admin)
 *     tags: [Banks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Ngân hàng câu hỏi Toán học"
 *               topic_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Tạo đề thi thành công
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 *       500:
 *         description: Lỗi server
 */
bankRoute.post('/create',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        BankController.create);

/**
 * @openapi
 * /banks/update/{id}:
 *   patch:
 *     summary: Cập nhật ngân hàng câu hỏi (yêu cầu admin)
 *     tags: [Banks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của ngân hàng câu hỏi cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Ngân hàng câu hỏi Toán học nâng cao"
 *               topic_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       202:
 *         description: Cập nhật ngân hàng câu hỏi thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy ngân hàng câu hỏi
 *       500:
 *         description: Lỗi server
 */
bankRoute.patch('/update/:id',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        BankController.update);

/**
 * @openapi
 * /banks/setAvailable/{id}:
 *   patch:
 *     summary: Thay đổi trạng thái đề thi theo ID (yêu cầu admin)
 *     tags: [Banks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của đề thi cần thay đổi trạng thái
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             available: false
 *     responses:
 *       204:
 *         description: Cập nhật trạng thái thành công
 *       404:
 *         description: Không tìm thấy ngân hàng câu hỏi
 *       500:
 *         description: Lỗi server
 */
bankRoute.patch('/setAvailable/:id',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        BankController.setAvailable);

/**
 * @openapi
 * /banks/remove/{id}:
 *   delete:
 *     summary: Xóa một ngân hàng câu hỏi theo ID (yêu cầu admin)
 *     tags: [Banks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của ngân hàng câu hỏi cần xóa
 *     responses:
 *       204:
 *         description: Xóa ngân hàng câu hỏi thành công
 *       404:
 *         description: Không tìm thấy ngân hàng câu hỏi
 *       500:
 *         description: Lỗi server
 */
bankRoute.delete('/remove/:id',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        BankController.remove);

/**
 * @swagger
 * /banks/questions/add/{id}:
 *   post:
 *     summary: Thêm câu hỏi vào ngân hàng câu hỏi (yêu cầu đăng nhập)
 *     tags: [Banks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của ngân hàng câu hỏi (bank)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question_id:
 *                 type: integer
 *                 example: 1
 *             required:
 *               - question_id
 *     responses:
 *       200:
 *         description: Thêm câu hỏi vào ngân hàng câu hỏi thành công
 *       404:
 *         description: Không tìm thấy ngân hàng câu hỏi
 */

bankRoute.post("/questions/add",
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        BankQuestionController.add);

/**
 * @swagger
 * /banks/questions/remove/{id}:
 *   delete:
 *     summary: Xóa câu hỏi khỏi ngân hàng câu hỏi (yêu cầu admin)
 *     tags: [Banks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của ngân hàng câu hỏi (bank)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question_id:
 *                 type: integer
 *                 example: 1
 *             required:
 *               - question_id
 *     responses:
 *       200:
 *         description: Xóa câu hỏi khỏi ngân hàng câu hỏi thành công
 *       404:
 *         description: Không tìm thấy ngân hàng câu hỏi
 */
bankRoute.delete("/questions/remove/:id",
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        BankQuestionController.remove);

export default bankRoute;
