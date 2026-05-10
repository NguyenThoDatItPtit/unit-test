// controllers/currentProgress.controller.ts
import { Request, Response } from "express";
import safeExecute from "../utils/safe.execute";
import { CurrentProgressService } from "../services/current.process.service";

export const CurrentProgressController = {
    async create(req: Request, res: Response) {
        const response = await safeExecute(async () => {
            const { current_progress} = req.body;
            const user_id = req.user?.user_id

            if (!current_progress || !user_id) {
                return { status: 400, message: "Thiếu thông tin current_progress hoặc user_id" };
            }

            const newProgress = await CurrentProgressService.create({
                current_progress: Number(current_progress),
                user_id: Number(user_id)
            });

            return { status: 201, data: newProgress, message: "Tạo tiến độ thành công" };
        });

        res.status(response.status).json(response);
    },

    async getByUserGoal(req: Request, res: Response) {
        const response = await safeExecute(async () => {
            const user_goal_id = Number(req.params.user_goal_id);
            if (!user_goal_id) {
                return { status: 400, message: "Thiếu user_goal_id" };
            }

            const progressList = await CurrentProgressService.getByUserGoal(user_goal_id);
            return { status: 200, data: progressList, message: "Danh sách tiến độ" };
        });

        res.status(response.status).json(response);
    },

    async delete(req: Request, res: Response) {
        const response = await safeExecute(async () => {
            const id = Number(req.params.id);
            if (!id) {
                return { status: 400, message: "Thiếu current_progress_id" };
            }

            await CurrentProgressService.delete(id);
            return { status: 200, message: "Xóa tiến độ thành công" };
        });

        res.status(response.status).json(response);
    }
};
