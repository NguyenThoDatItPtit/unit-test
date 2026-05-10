import { Router } from "express";
import UserController from "../controllers/user.controller";
import Authentication from "../middleware/authentication";
import {ADMIN} from "../config/permission";

const userRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API quản lý người dùng
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lấy danh sách tất cả user (yêu cầu admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Thiếu hoặc sai token
 *       403:
 *         description: Không có quyền
 */
userRouter.get(
  "/",
  Authentication.AuthenticateToken,
  Authentication.AuthorizeRoles(...ADMIN), 
  UserController.getAll
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Lấy thông tin user theo ID (cần đăng nhập)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy user
 */
userRouter.get(
  "/:id",
  Authentication.AuthenticateToken,
  UserController.getOne
);

/**
 * @swagger
 * /users/update/{id}:
 *   put:
 *     summary: Cập nhật user (chủ sở hữu hoặc admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của user cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 example: Khiêm test update
 *               email:
 *                 type: string
 *                 example: "testupdate@example.com"
 *               password_hash:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *               role_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy user
 */
userRouter.put(
  "/update/:id",
  Authentication.AuthenticateToken,
  UserController.update // logic check quyền nằm trong controller
);

/**
 * @swagger
 * /users/remove/{id}:
 *   delete:
 *     summary: Xóa user (chỉ admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy user
 */
userRouter.delete(
  "/remove/:id",
  Authentication.AuthenticateToken,
  Authentication.AuthorizeRoles(...ADMIN), // chỉ admin được xóa
  UserController.remove
);

userRouter.put(
  "/update",
  Authentication.AuthenticateToken,
  UserController.update // logic check quyền nằm trong controller
);


export default userRouter;