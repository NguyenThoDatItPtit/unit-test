import { Request, Response } from 'express';
import UserService from '../services/user.service';
import safeExecute, { DefaultResponse } from '../utils/safe.execute';

const UserController = {
    // Lấy toàn bộ user
    async getAll(req: Request, res: Response) {
        const response: DefaultResponse<any> = await safeExecute(async () => {
            const {
                page = "1",
                status = "All",
                role = "All",
                search = "",
            } = req.query;
            
            const pageNumber = Number(page);

            const result = await UserService.getAll(
                pageNumber,
                status as string,
                role as number | string,
                search as string
            );

            return {
                status: 200,
                data: {
                    users: result.users,
                    totalPages: result.totalPages,
                },
                message: "Danh sách người dùng",
            };
        });

        res.status(response.status).json(response);
    },

    // Lấy user theo ID
    async getOne(req: Request, res: Response) {
        const id = Number(req.params.id);

        const response: DefaultResponse<any> = await safeExecute(async () => {
            const user = await UserService.getById(id);
            return { status: 200, data: user, message: 'Lấy thông tin người dùng thành công' };
        });

        if (response.error === 'USER_NOT_FOUND') {
            response.status = 404;
            response.message = 'Không tìm thấy người dùng';
            delete response.error;
        }

        res.status(response.status).json(response);
    },

    // Cập nhật user
    async update(req: Request, res: Response) {
        const { id } = req.params;
        console.log(id);

        const response: DefaultResponse<any> = await safeExecute(async () => {
            const updated = await UserService.update(Number(id), req.body);
            return { status: 200, data: updated, message: 'Cập nhật người dùng thành công' };
        });

        if (response.error === 'USER_NOT_FOUND') {
            response.status = 404;
            response.message = 'Không tìm thấy người dùng để cập nhật';
            delete response.error;
        }

        res.status(response.status).json(response);
    },

    // Xóa user
    async remove(req: Request, res: Response) {
        const id = Number(req.params.id);

        const response: DefaultResponse<any> = await safeExecute(async () => {
            await UserService.remove(id);
            return { status: 200, message: 'Xóa người dùng thành công' };
        });

        if (response.error === 'USER_NOT_FOUND') {
            response.status = 404;
            response.message = 'Không tìm thấy người dùng để xóa';
            delete response.error;
        }

        res.status(response.status).json(response);
    },
};

export default UserController;
