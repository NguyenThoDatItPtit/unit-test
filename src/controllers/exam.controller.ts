import { Request, Response } from "express";
import safeExecute, { DefaultResponse } from "../utils/safe.execute";
import ExamService from "../services/exam.service";
import { Exam } from "../models/exam.model";

const ExamController = {
  async list(req: Request, res: Response) {
    const result: DefaultResponse<any> = await safeExecute(async () => {
      const page = Number(req.query.page) || 1;
      const status = req.query.available?.toString() || "All";
      const searchValue = req.query.keyword?.toString() || "";
      const topicIds = req.query.topic_ids
        ? Number(req.query.topic_ids)
        : "All";
        
      const subject_id = req.query.subject_id
        ? Number(req.query.subject_id)
        : "All"
        
      return {
        status: 200,
        message: "Lấy danh sách đề thi thành công",
        data: await ExamService.list(page, status, searchValue, topicIds, subject_id),
      };
    });

    return res.status(result.status).json(result);
  },

  async getById(req: Request, res: Response) {
    const result: DefaultResponse<any> = await safeExecute(async () => {

      const exam_id = Number(req.params.id);
      if (isNaN(exam_id)) {
        return {
          status: 400,
          message: "exam_id không hợp lệ",
          data: null
        };
      }

      const { question, subject_type } = await ExamService.getById(exam_id);

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
        message: "Tạo đề thi thành công",
        data: await ExamService.create({ ...req.body } as Exam),
      };
    });

    return res.status(result.status).json(result);
  },

  async update(req: Request, res: Response) {
    const result: DefaultResponse<any> = await safeExecute(async () => {
      return {
        status: 202,
        message: "Cập nhật đề thi thành công",
        data: await ExamService.update(Number(req.params.id), req.body),
      };
    });

    return res.status(result.status).json(result);
  },

  async setAvailable(req: Request, res: Response) {

    const result: DefaultResponse<any> = await safeExecute(async () => {
      return {
        status: 202,
        message: "Đổi trạng thái đề thi thành công",
        data: await ExamService.setAvailable(
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
        message: "Xóa đề thi thành công",
        data: await ExamService.remove(Number(req.params.id)),
      };
    });

    return res.status(result.status).json(result);
  },

  async submit(req: Request, res: Response) {
    const result: DefaultResponse<any> = await safeExecute(async () => {
      const { exam_id, subject_type, time_test, user_name } = req.query;
      const user_id = req.user?.user_id;
      const { do_exam } = req.body

      if (!exam_id || !subject_type || !time_test) {
        return {
          status: 400,
          message: "Thiếu tham số exam_id, subject_type hoặc time_test",
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

      if (!Array.isArray(do_exam)) {
        return {
          status: 400,
          message: "Dữ liệu do_exam không hợp lệ",
          data: null
        };
      }

      return {
        status: 200,
        message: "Nộp đè thi thành công",
        data: await ExamService.submit(Number(exam_id),
          Number(user_id), do_exam, Number(time_test), Number(subject_type),
          String(user_name)
        )
      }
    });
    return res.status(result.status).json(result);
  },

  async getExamRanking(req: Request, res: Response) {
    const result: DefaultResponse<any> = await safeExecute(async () => {
      const { id } = req.params;
      const user_id = req?.user?.user_id
      const { user_name, page } = req.query;

      if (!id) {
        return {
          status: 400,
          message: "Thiếu exam_id",
          data: null
        };
      }

      const ranking = await ExamService.getExamRanking(Number(id), Number(user_id), String(user_name), Number(page));

      return {
        status: 200,
        message: "Lấy bảng xếp hạng thành công",
        data: {
          ranking
        }
      };
    });

    return res.status(result.status).json(result);
  },

  async getUserExamHistory(req: Request, res: Response) {
    const result: DefaultResponse<any> = await safeExecute(async () => {
      const user_id = req?.user?.user_id;
      const data = await ExamService.getUserListExamHistory(Number(user_id));
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
      const history_exam_id = Number(req.query.history_exam_id);
      const exam_id = Number(req.query.exam_id);
  
      // Validate input
      if (!Number.isInteger(history_exam_id) || !Number.isInteger(exam_id)) {
        return {
          status: 400,
          message: "history_exam_id hoặc exam_id không hợp lệ",
          data: null
        };
      }
  
      const data = await ExamService.getUserAnswer(
        history_exam_id,
        exam_id
      );
  
      // Không có dữ liệu hoặc không có câu hỏi ở mọi type
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

  async getQuestionIdExam(req: Request, res: Response) {
    const result: DefaultResponse<any> = await safeExecute(async () => {
      const { id } = req.params
      const data = await ExamService.getQuestionIdExam(Number(id));
      return {
        status: 200,
        message: "Lay cau hoi bai thi thanh cong",
        data: data
      }
    });

    return res.status(result.status).json(result)
  },

  async checkDoExam(req: Request, res: Response) {
    const result: DefaultResponse<any> = await safeExecute(async () => {
      const user_id = req.user?.user_id;
      const { exam_id } = req.query;

      if (!user_id || !exam_id) {
        return {
          status: 400,
          message: "Thiếu user_id hoặc exam_id",
          data: null
        };
      }

      const data = await ExamService.checkDoExam(
        Number(exam_id),
        Number(user_id)
      );

      return {
        status: 200,
        message: "Kiểm tra trạng thái làm bài thành công",
        data
      };
    });

    return res.status(result.status).json(result);
  }
};

export default ExamController;
