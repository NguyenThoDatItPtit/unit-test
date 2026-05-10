import safeExecute, { DefaultResponse } from "../utils/safe.execute";
import { Request, Response } from "express";
import BankService from "../services/bank.service";

const BankController = {
    async list(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            const page = Number(req.query.page) || 1;
            const status = req.query.available?.toString() || "All";
            const searchValue = req.query.keyword?.toString().trim() || "";
            
            const topicIds = req.query.topic_ids
                ? Number(req.query.topic_ids)
                : "All";

            const subject_id = req.query.subject_id
                ? Number(req.query.subject_id)
                : "All"
            return {
                status: 200,
                message: "Lấy danh sách đề thi thành công",
                data: await BankService.listBank(page, status, searchValue, topicIds, subject_id),
            };
        });

        return res.status(result.status).json(result);
    },

    async getById(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {

            const bank_id = Number(req.params.id);
            if (isNaN(bank_id)) {
                return {
                    status: 400,
                    message: "exam_id không hợp lệ",
                    data: null
                };
            }

            const { question, subject_type } = await BankService.getById(bank_id);

            const role = req.user?.role_id;

            if (question && role !== 2) {
                // flatten tất cả câu hỏi
                const allQuestions = Object.values(question).flat();

                allQuestions.forEach(q => {
                    q.answers?.forEach((a: any) => {
                        delete a.is_correct;
                    });
                });
            }

            return {
                status: 200,
                message: "Lấy thông tin đề thi thành công",
                data: { question: question, subject_type: subject_type }
            };
        });
        return res.status(result.status).json(result);
    },

    async create(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            return {
                status: 201,
                message: "Tạo ngân hàng câu hỏi thành công",
                data: await BankService.create(req.body),
            };
        });
        return res.status(result.status).json(result);
    },

    async update(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            return {
                status: 202,
                message: "Cập nhật ngân hàng câu hỏi thành công",
                data: await BankService.update(Number(req.params.id), req.body),
            };
        });
        return res.status(result.status).json(result);
    },

    async setAvailable(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            return {
                status: 202,
                message: "Đổi trạng thái ngân hàng câu hỏi thành công",
                data: await BankService.setAvailable(
                    Number(req.params.id),
                    Boolean(req.body.available)
                ),
            };
        });
        return res.status(result.status).json(result);
    },

    async remove(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            return {
                status: 204,
                message: "Xoá ngân hàng câu hỏi thành công",
                data: await BankService.remove(Number(req.params.id)),
            };
        });
        return res.status(result.status).json(result);
    },

    async submit(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            const { bank_id, subject_type, time_test, user_name } = req.query;
            const user_id = req.user?.user_id;
            const { do_bank } = req.body

            if (!bank_id || !subject_type || !time_test) {
                return {
                    status: 400,
                    message: "Thiếu tham số bank_id, subject_type hoặc time_test",
                    data: null
                };
            }

            if (!user_id) {
                return {
                    status: 401,
                    message: "Không xác thực được người dùng",
                    data: null
                };
            }

            if (!Array.isArray(do_bank)) {
                return {
                    status: 400,
                    message: "Dữ liệu do_bank không hợp lệ",
                    data: null
                };
            }

            return {
                status: 200,
                message: "Nộp đè thi thành công",
                data: await BankService.submit(Number(bank_id),
                    Number(user_id), do_bank, Number(time_test), Number(subject_type)
                )
            }
        });
        return res.status(result.status).json(result);
    },

    async getUserBankHistory(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            const user_id = req?.user?.user_id;

            const data = await BankService.getUserListBankHistory(Number(user_id));
            return {
                status: 200,
                message: "Lấy lịch sử làm bài thành công",
                data
            };
        });

        return res.status(result.status).json(result);
    },

    async getUserAnswer(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            const history_bank_id = Number(req.query.history_bank_id);
            const bank_id = Number(req.query.bank_id);

            /* ========== VALIDATE INPUT ========== */
            if (
                !Number.isInteger(history_bank_id) ||
                !Number.isInteger(bank_id)
            ) {
                return {
                    status: 400,
                    message: "history_bank_id hoặc bank_id không hợp lệ",
                    data: null
                };
            }

            /* ========== GET DATA ========== */
            const data = await BankService.getUserAnswer(
                history_bank_id,
                bank_id
            );

            /* ========== CHECK EMPTY ========== */
            const questions = data?.questions;
            const isEmpty =
                !questions ||
                (
                    (!questions[1] || questions[1].length === 0) &&
                    (!questions[2] || questions[2].length === 0) &&
                    (!questions[3] || questions[3].length === 0)
                );

            if (isEmpty) {
                return {
                    status: 404,
                    message: "Không tìm thấy bài làm",
                    data: null
                };
            }

            return {
                status: 200,
                message: "Lấy bài đã làm thành công",
                data
            };
        });

        return res.status(result.status).json(result);
    },

    async getQuestionIdBank(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            const { id } = req.params
            const data = await BankService.getQuestionIdBank(Number(id));
            return {
                status: 200,
                message: "Lay cau hoi bai luyen tap thanh cong",
                data: data
            }
        });

        return res.status(result.status).json(result)
    },
}

export default BankController;