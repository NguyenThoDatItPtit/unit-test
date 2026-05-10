import { Request, Response } from "express";
import StudyScheduleService from "../services/schedule.study.service"
import safeExecute from "../utils/safe.execute";
import { DefaultResponse } from "../utils/safe.execute";

const StudyScheduleController = {
  async getAll(req: Request, res: Response) {
    const response: DefaultResponse<any> = await safeExecute(async () => {
      const list = await StudyScheduleService.getAll();
      return { status: 200, data: list, message: "Danh sách lịch học" };
    });
    res.status(response.status).json(response);
  },

  async getById(req: Request, res: Response) {
    const response: DefaultResponse<any> = await safeExecute(async () => {
      const id = Number(req.params.id);
      const item = await StudyScheduleService.getById(id);
      if (!item) return { status: 404, data: null, message: "Không tìm thấy lịch học" };
      return { status: 200, data: item, message: "Chi tiết lịch học" };
    });
    res.status(response.status).json(response);
  },

  async create(req: Request, res: Response) {
    const response: DefaultResponse<any> = await safeExecute(async () => {
      const created = await StudyScheduleService.create(req.body);
      return { status: 201, data: created, message: "Tạo lịch học thành công" };
    });
    res.status(response.status).json(response);
  },

  async update(req: Request, res: Response) {
    const response: DefaultResponse<any> = await safeExecute(async () => {
      const id = Number(req.params.id);
      const updated = await StudyScheduleService.update(id, req.body);
      if (!updated) return { status: 404, data: null, message: "Không tìm thấy lịch học" };
      return { status: 200, data: updated, message: "Cập nhật thành công" };
    });
    res.status(response.status).json(response);
  },

  async delete(req: Request, res: Response) {
    const response: DefaultResponse<any> = await safeExecute(async () => {
      const id = Number(req.params.id);
      const ok = await StudyScheduleService.delete(id);
      if (!ok) return { status: 404, data: null, message: "Không tìm thấy lịch học" };
      return { status: 200, data: true, message: "Xoá thành công" };
    });
    res.status(response.status).json(response);
  },

  async filter(req: Request, res: Response) {
    const response: DefaultResponse<any> = await safeExecute(async () => {
      const status = String(req.query.status);
      const ok = await StudyScheduleService.filter(status);
      return { status: 200, data: ok, message: "Lọc thành công" };
    });
    res.status(response.status).json(response);
  }
};

export default StudyScheduleController;
