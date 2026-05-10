import { Request, Response } from "express";
import  safeExecute  from "../utils/safe.execute";
import { UserGoalService } from "../services/user.goal.service";

export const UserGoalController = {
    async getAll(req: Request, res: Response) {
        const response = await safeExecute(async () => {
            const userId = req.user?.user_id;

            if (!userId) {
                return { status: 401, message: "Không tìm thấy user id" };
            }
    
            const goals = await UserGoalService.getAll(userId);
            return { status: 200, data: goals, message: "Danh sách mục tiêu" };
        });

        res.status(response.status).json(response);
    },

    async create(req: Request, res: Response) {
        const response = await safeExecute(async () => {
            const userId = req.user?.user_id;
            const {form} = req.body;
            
            const newGoal = await UserGoalService.create({
                ...form,
                user_id: userId
            });

            return { status: 201, data: newGoal, message: "Tạo mục tiêu thành công" };
        });

        res.status(response.status).json(response);
    },

    async delete(req: Request, res: Response) {
        const response = await safeExecute(async () => {
            const id = Number(req.params.id);
            const userId = req.user?.user_id;

            if (!userId) {
                return { status: 401, message: "Không tìm thấy user id" };
            }    

            await UserGoalService.delete(id, userId);

            return { status: 200, message: "Xoá mục tiêu thành công" };
        });

        res.status(response.status).json(response);
    }
};
