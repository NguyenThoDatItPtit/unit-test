import { Request, Response } from 'express';
import RoleService from '../services/role.service';
import safeExcute, { DefaultResponse } from '../utils/safe.execute';

const RoleController = {
  async getAll(req: Request, res: Response) {
    const response: DefaultResponse<any> = await safeExcute(async () => {
      const roles = await RoleService.getAll();
      return { status: 200, data: roles, message: 'Danh sách vai trò' };
    });
    res.status(response.status).json(response);
  },

  async getOne(req: Request, res: Response) {
    const id = Number(req.params.id);
    const response: DefaultResponse<any> = await safeExcute(async () => {
      const role = await RoleService.getById(id);
      return { status: 200, data: role, message: 'Lấy vai trò thành công' };
    });
    // nếu service throw 'ROLE_NOT_FOUND', safeExcute sẽ catch và trả 500, cần map thành 404
    if (response.error === 'ROLE_NOT_FOUND') {
      response.status = 404;
      response.message = 'Không tìm thấy vai trò';
      delete response.error;
    }
    res.status(response.status).json(response);
  },

  async create(req: Request, res: Response) {
    const response: DefaultResponse<any> = await safeExcute(async () => {
      const role = await RoleService.create(req.body);
      return {
        status: 201,
        data: role,
        message: 'Tạo vai trò thành công',
      };
    });
    if (response.error === "ROLE_EXISTS") {
      response.status = 400;
      response.message = "Role đã tồn tại";
      delete response.error;
    }
    res.status(response.status).json(response);
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const response: DefaultResponse<any> = await safeExcute(async () => {
      const updated = await RoleService.update(id, req.body);
      return { status: 200, data: updated, message: 'Cập nhật vai trò thành công' };
    });
    if (response.error === 'ROLE_NOT_FOUND') {
      response.status = 404;
      response.message = 'Không tìm thấy vai trò để cập nhật';
      delete response.error;
    }
    res.status(response.status).json(response);
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const response: DefaultResponse<any> = await safeExcute(async () => {
      await RoleService.remove(id);
      return { status: 200, message: 'Xóa vai trò thành công' };
    });
    if (response.error === 'ROLE_NOT_FOUND') {
      response.status = 404;
      response.message = 'Không tìm thấy vai trò để xóa';
      delete response.error;
    }
    res.status(response.status).json(response);
  },
};

export default RoleController;
