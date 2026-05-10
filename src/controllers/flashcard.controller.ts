import { Request, Response } from "express";
import { FlashcardService } from "../services/flashcard.service";
import safeExecute, { DefaultResponse } from "../utils/safe.execute";

//flashcard controller
export const FlashcardController = {
  add: async (req: Request, res: Response) => {
    const result = await safeExecute(
      async (): Promise<DefaultResponse<any>> => {
        const {example} = req.body;
        if(example === undefined) req.body.example = null
        console.log({body :req.body, flashcard_deck_id: req.params.id});
        
        const newCard = await FlashcardService.add({
          ...req.body,
          flashcard_deck_id: Number(req.params.id),
        });
        return {
          status: 201,
          data: newCard,
          message: "Flashcard create successfully",
        };
      }
    );
    return res.status(result.status).json(result);
  },

  update: async (req: Request, res: Response) => {
    const result = await safeExecute(
      async (): Promise<DefaultResponse<any>> => {
        const updated = await FlashcardService.update(
          Number(req.params.id),
          req.body
        );
        if (!updated) {
          return { status: 404, message: "Flashcard not found" };
        }
        return { status: 202, data: updated, message: "Flashcard update" };
      }
    );
    return res.status(result.status).json(result);
  },

  remove: async (req: Request, res: Response) => {
    const result = await safeExecute(
      async (): Promise<DefaultResponse<any>> => {
        const ok = await FlashcardService.remove(Number(req.params.id));
        if (!ok) {
          return { status: 404, message: "Flashcard not found" };
        }
        return { status: 204, message: "Deleted successfully" };
      }
    );
    return res.status(result.status).json(result);
  },

  quiz: async (req: Request, res: Response) => {
    const result = await safeExecute(
      async (): Promise<DefaultResponse<any>> => {
        const id = Number(req.params.id);
        if (isNaN(id)) {
          return { status: 400, message: "Invalid deck ID" };
        }

        const flashcards = await FlashcardService.quizFlashcard(id);

        if (!flashcards || flashcards.length === 0) {
          return { status: 404, message: "Không có flashcard để luyện tập" };
        }

        return {
          status: 200,
          message: "Lấy 20 flashcard để luyện tập thành công",
          data: flashcards,
        };
      }
    );

    return res.status(result.status).json(result);
  },

  review: async (req: Request, res: Response) => {
    const result = await safeExecute(
      async (): Promise<DefaultResponse<any>> => {
        const id = Number(req.params.id);
        if (isNaN(id)) {
          return { status: 400, message: "Invalid deck ID" };
        }

        const flashcards = await FlashcardService.reviewFlashcard(id);

        if (!flashcards || flashcards.length === 0) {
          return { status: 404, message: "Không có flashcard để luyện tập" };
        }

        return {
          status: 200,
          message: "Lấy 20 flashcard để luyện tập thành công",
          data: flashcards,
        };
      }
    );

    return res.status(result.status).json(result);
  },

  submit: async (req: Request, res: Response) => {
    const result = await safeExecute(
      async (): Promise<DefaultResponse<any>> => {
        const { answerCorrect = [], answerMiss = [] } = req.body;
        console.log(answerCorrect, answerMiss);
        
        // Kiểm tra đầu vào hợp lệ
        if (!Array.isArray(answerCorrect) || !Array.isArray(answerMiss)) {
          return { status: 400, message: "Dữ liệu không hợp lệ" };
        }
        // Gọi service để xử lý cập nhật trạng thái flashcard
        await FlashcardService.submitFlashcard(answerCorrect, answerMiss);
        return {
          status: 200,
          message: "Cập nhật kết quả flashcard thành công",
          data: {
            correctCount: answerCorrect.length,
            missCount: answerMiss.length,
          },
        };
      }
    );

    return res.status(result.status).json(result);
  },
};
