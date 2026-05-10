import { Request, Response } from "express";
import { BankQuestionService } from "../services/bank.question.service";
import safeExecute, { DefaultResponse } from "../utils/safe.execute";


export const BankQuestionController = {
    async add(req: Request, res: Response) {
        const result = await safeExecute(async (): Promise<DefaultResponse<any>> => {
            
            const newQuestion = await BankQuestionService.add(
                req.body.selectedQuestions
            );
            return { status: 201, data: newQuestion, message: "Question add successfully" };
        });
        return res.status(result.status).json(result);
    },

    async remove(req: Request, res: Response) {
        const result = await safeExecute(async (): Promise<DefaultResponse<any>> => {
            const ok = await BankQuestionService.remove({
                bank_id: Number(req.params.id),
                question_id: Number(req.body.question_id),
            });
            if (!ok) {
                return { status: 404, message: "BankQuestion not found" };
            }
            return { status: 204, message: "Deleted successfully" };
        });
        return res.status(result.status).json(result);
    },
}