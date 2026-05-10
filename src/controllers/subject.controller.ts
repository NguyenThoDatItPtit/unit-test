import SubjectService from "../services/subject.service";
import safeExecute, { DefaultResponse } from "../utils/safe.execute";
import { Request, Response } from "express";

const SubjectController = {
    async getAll(req: Request, res: Response) {
        const responses: DefaultResponse<any> = await safeExecute(async () => {
            return {
                status: 200,
                message: "Lấy danh sách môn học thành công",
                data: await SubjectService.getAll()
            } as DefaultResponse<any>;
        });
        res.json(responses);
    },

    async create(req: Request, res: Response) {
        const responses: DefaultResponse<any> = await safeExecute(async () => {
            return {
                status: 201,
                message: "Tạo môn học thành công",
                data: await SubjectService.create(req.body)
            } as DefaultResponse<any>;
        });
        res.json(responses);
    },

    async update(req: Request, res: Response) {
        const responses: DefaultResponse<any> = await safeExecute(async () => {
            return {
                status: 202,
                message: "Cập nhật môn học thành công",
                data: await SubjectService.update(Number(req.params.id), req.body)
            } as DefaultResponse<any>;
        });
        res.json(responses);
    },

    async setAvailable(req: Request, res: Response) {
        const responses: DefaultResponse<any> = await safeExecute(async () => {
            return {
                status: 202,
                message: "Đổi trạng thái môn học thành công",
                data: await SubjectService.setAvailable(Number(req.params.id), Boolean(req.body.available))
            } as DefaultResponse<any>;
        });
        res.json(responses);
    },

    async remove(req: Request, res: Response) {
        const responses: DefaultResponse<any> = await safeExecute(async () => {
            return {
                status: 204,
                message: "Xoá môn học thành công",
                data: await SubjectService.remove(Number(req.params.id))
            } as DefaultResponse<any>;
        });
        res.json(responses);
    },
}

export default SubjectController;