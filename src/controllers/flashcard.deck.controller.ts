import { FlashcardDeckService } from "../services/flashcard.deck.service";
import safeExecute from "../utils/safe.execute";
import { DefaultResponse } from "../utils/safe.execute";
import { Request, Response } from "express";

//flashcard_deck controller
export const FlashcardDeckController = {
  getAll: async (req: Request, res: Response) => {
    const result = await safeExecute(
      async (): Promise<DefaultResponse<any>> => {
        const data = await FlashcardDeckService.getAll(req.query);
        return { status: 200, data, message: "List flashcard-deck" };
      }
    );
    return res.status(result.status).json(result);
  },

  getById: async (req: Request, res: Response) => {
    const result = await safeExecute(async (): Promise<DefaultResponse<any>> => {
      const card = await FlashcardDeckService.getById(Number(req.params.id));
      if (!card) {
        return { status: 404, message: "Flashcard not found" };
      }
      return { status: 200, data: card, message: "Flashcard information" };
    });
    return res.status(result.status).json(result);
  },

  create: async (req: Request, res: Response) => {
    const result = await safeExecute(async (): Promise<DefaultResponse<any>> => {
      const newDeck = await FlashcardDeckService.create({
        ...req.body,
        user_id: req.user!.user_id
      });
      return {
        status: 201,
        data: newDeck,
        message: "Create flashcard_deck successfully",
      };
    });
  
    return res.status(result.status).json(result);
  },
  

  update: async (req: Request, res: Response) => {
    const result = await safeExecute(
      async (): Promise<DefaultResponse<any>> => {
        const updated = await FlashcardDeckService.update(
          Number(req.params.id),
          req.body
        );
        if (!updated) {
          return { status: 404, message: "Deck not found" };
        }
        return { status: 202, data: updated };
      }
    );
    return res.status(result.status).json(result);
  },

  remove: async (req: Request, res: Response) => {
    const result = await safeExecute(
      async (): Promise<DefaultResponse<any>> => {
        const ok = await FlashcardDeckService.remove(Number(req.params.id));
        if (!ok) {
          return { status: 404, message: "Deck not found" };
        }
        return { status: 204, message: "Deleted successfully" };
      }
    );
    return res.status(result.status).json(result);
  },
};
