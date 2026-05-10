import { Router } from 'express';
import RoleController from '../controllers/role.controller';
import Authentication from "../middleware/authentication";
import {ADMIN} from "../config/permission";

const roleRoute = Router();

/**
 * @openapi
 * /roles:
 *   get:
 *     summary: Lấy danh sách tất cả roles (yêu cầu admin)
 *     tags:
 *       - Role
 *     responses:
 *       200:
 *         description: Danh sách role
 *       500:
 *         description : loi
 */
roleRoute.get('/',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        RoleController.getAll);

/**
 * @openapi
 * /roles/{id}:
 *   get:
 *     summary: Lấy role theo ID (yêu cầu admin)
 *     tags:
 *       - Role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role tìm thấy
 *       404:
 *         description: Không tìm thấy role
 *       500:
 *         description : loi
 */
roleRoute.get('/:id',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        RoleController.getOne);

/**
 * @openapi
 * /roles/create:
 *   post:
 *     summary: Tạo role mới (yêu cầu admin)
 *     tags:
 *       - Role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_id
 *               - role_name
 *             properties:
 *               role_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role đã được tạo
 *       500:
 *         description : loi
 */
roleRoute.post('/create',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        RoleController.create);

/**
 * @openapi
 * /roles/update/{id}:
 *   put:
 *     summary: Cập nhật role theo ID (yêu cầu admin)
 *     tags:
 *       - Role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_name:
 *                 type: string
 *                 example: "Admin"
 *     responses:
 *       202:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy role
 *       500:
 *         description: Lỗi server
 */
roleRoute.put('/update/:id',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        RoleController.update);

/**
 * @openapi
 * /roles/remove/{id}:
 *   delete:
 *     summary: Xóa role theo ID (yêu cầu admin)
 *     tags:
 *       - Role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy role
 *       500:
 *         description: Lỗi server
 */
roleRoute.delete('/remove/:id',
        Authentication.AuthenticateToken,
        Authentication.AuthorizeRoles(...ADMIN),
        RoleController.remove);

export default roleRoute;
