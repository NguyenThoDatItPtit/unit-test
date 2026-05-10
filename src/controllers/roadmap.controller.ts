import { Request, Response } from "express";
import safeExecute from "../utils/safe.execute";
import RoadmapService from "../services/roadmap.service"
import { DefaultResponse } from "../utils/safe.execute"

const RoadmapController = {
    // Lấy tất cả roadmap
    async getAll(req: Request, res: Response) {
        const response: DefaultResponse<any> = await safeExecute(async () => {
            const list = await RoadmapService.getAll();
            return {
                status: 200,
                data: list,
                message: "Danh sách roadmap"
            };
        });

        return res.status(response.status).json(response);
    },

    // Lấy theo ID
    async getById(req: Request, res: Response) {
        const response: DefaultResponse<any> = await safeExecute(async () => {
            const id = Number(req.params.id);

            const item = await RoadmapService.getById(id);
            if (!item) {
                return { status: 404, data: null, message: "Không tìm thấy bước roadmap" };
            }

            return {
                status: 200,
                data: item,
                message: "Chi tiết roadmap"
            };
        });

        return res.status(response.status).json(response);
    },

    // Tạo mới
    async create(req: Request, res: Response) {
        const response: DefaultResponse<any> = await safeExecute(async () => {
            const { title, description, topic_id } = req.body;

            const created = await RoadmapService.create({
                title,
                description,
                topic_id: topic_id
            });

            return {
                status: 201,
                data: created,
                message: "Tạo bước roadmap thành công"
            };
        });

        return res.status(response.status).json(response);
    },

    // Cập nhật
    async update(req: Request, res: Response) {
        const response: DefaultResponse<any> = await safeExecute(async () => {
            const id = Number(req.params.id);
             const { title, description, topic_id } = req.body;       
            const updated = await RoadmapService.update(id, {
                title,
                description,
                topic_id
            });

            if (!updated) {
                return { status: 404, data: null, message: "Roadmap không tồn tại" };
            }

            return {
                status: 200,
                data: updated,
                message: "Cập nhật thành công"
            };
        });

        return res.status(response.status).json(response);
    },

    // Xoá
    async delete(req: Request, res: Response) {
        const response: DefaultResponse<any> = await safeExecute(async () => {
            const id = Number(req.params.id);

            const ok = await RoadmapService.delete(id);
            if (!ok) {
                return { status: 404, data: null, message: "Không tìm thấy bước roadmap" };
            }

            return {
                status: 200,
                data: true,
                message: "Xoá thành công"
            };
        });

        return res.status(response.status).json(response);
    },
};

export default RoadmapController;
