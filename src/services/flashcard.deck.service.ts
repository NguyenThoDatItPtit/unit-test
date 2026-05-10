import { query } from "../config/database";
import { FlashcardDeck } from "../models/flashcard.deck.model";
import { Flashcard } from "../models/flashcard.model";
import pool from "../config/database";

//Flashcard-deck Service
export const FlashcardDeckService = {
  async getAll(
    queryParams: any
  ): Promise<{ data: FlashcardDeck[]; totalPages: number } | null> {
    const page = parseInt(queryParams.page as string, 10) || 1;
    const limit = 11;
    const offset = (page - 1) * limit;
    const client = await pool.connect();
    try {
      const result = await query(
        `SELECT flashcard_deck_id, title, description, created_at
         FROM flashcard_deck
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const countResult = await client.query(
        "SELECT COUNT(*) as total FROM flashcard_deck"
      );

      await client.query("COMMIT");

      const totalItems = parseInt(countResult.rows[0].total, 10);
      const totalPages = Math.ceil(totalItems / limit);

      return { data: result.rows, totalPages };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Lỗi khi lấy flashcards:", error);
      return null;
    } finally {
      client.release();
    }
  },

  async getById(
    id: number,
  ): Promise<{ data: Flashcard[]; totalFlashcard : number; totalDone : number } | null> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1Lấy dữ liệu flashcards theo page
      const result = await client.query(
        "SELECT * FROM flashcard WHERE flashcard_deck_id = $1 ORDER BY flashcard_id",
        [id]
      );
      console.log(result);

      //Lấy tổng số flashcards
      const countResult = await client.query(
        "SELECT COUNT(*) as total FROM flashcard WHERE flashcard_deck_id = $1",
        [id]
      );

      //lấy tổng số thẻ done
      const countDone = await client.query(
        "SELECT COUNT(*) as total FROM flashcard WHERE flashcard_deck_id = $1 AND status = 'done'",
        [id]
      )

      await client.query("COMMIT");

      const totalItems = parseInt(countResult.rows[0].total, 10);
      const totalDone = parseInt(countDone.rows[0].total, 10)
      return {
        data: result.rows || [],
        totalFlashcard : totalItems,
        totalDone 
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Lỗi khi lấy flashcards:", error);
      return null;
    } finally {
      client.release();
    }
  },

  async create(data: FlashcardDeck): Promise<FlashcardDeck> {
    const result = await query(
      `INSERT INTO flashcard_deck (title, description, user_id)
         VALUES ($1,$2,$3) RETURNING *`,
      [data.title, data.description, data.user_id]
    );
    return result.rows[0];
  },

  async update(
    id: number,
    data: Partial<Omit<FlashcardDeck, "flashcard_deck_id" | "created_at">>
  ): Promise<FlashcardDeck | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      fields.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE flashcard_deck SET ${fields.join(
        ", "
      )} WHERE flashcard_deck_id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async remove(id: number): Promise<boolean> {
    const result = await query(
      "DELETE FROM flashcard_deck WHERE flashcard_deck_id = $1",
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  },
};
