import { query } from "../config/database";
import { Flashcard } from "../models/flashcard.model";
import pool from "../config/database";

// Flashcard Service
export const FlashcardService = {
  async add(data: Flashcard): Promise<Flashcard | null> {
    const client = await pool.connect();
    try {
      // Nếu bạn cần kiểm tra số lượng flashcard hiện có trong deck:
      const checkCount = await client.query(
        `SELECT COUNT(*) AS count FROM flashcard WHERE flashcard_deck_id = $1`,
        [data.flashcard_deck_id]
      );

      if (checkCount.rows[0].count >= 50) return null;
      // Thêm flashcard mới
      const result = await client.query(
        `INSERT INTO flashcard (front, back, example, flashcard_deck_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [data.front, data.back, data.example, data.flashcard_deck_id]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Lỗi khi thêm flashcard:", error);
      return null;
    } finally {
      client.release();
    }
  },

  async update(
    id: number,
    data: Partial<Flashcard>
  ): Promise<Flashcard | null> {
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
      `UPDATE flashcard SET ${fields.join(
        ", "
      )} WHERE flashcard_id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async remove(id: number): Promise<boolean> {
    const result = await query(
      "DELETE FROM flashcard WHERE flashcard_id = $1",
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  },

  async quizFlashcard(id: number): Promise<Flashcard[] | []> {
    const result = await query(
      `
      SELECT * 
      FROM flashcard
      WHERE flashcard_deck_id = $1
        AND (status = 'pending' OR status = 'miss' OR status IS NULL)
      ORDER BY RANDOM()
      LIMIT 20
      `,
      [id]
    )

    return result.rows || [];
  },

  async reviewFlashcard(id: number): Promise<Flashcard[] | []> {
    const result = await query(
      `
      SELECT * 
      FROM flashcard
      WHERE flashcard_deck_id = $1
      ORDER BY RANDOM()
      LIMIT 20
      `,
      [id]
    )

    return result.rows || [];
  },

  async submitFlashcard(answerCorrect: number[], answerMiss: number[]): Promise<void> {
    if (answerCorrect.length > 0) {
      await query(`
      UPDATE flashcard
      SET status = 'done'
      WHERE flashcard_id = ANY($1)
      `,
        [answerCorrect])
    }
    if (answerMiss.length > 0) {
      await query(`
      UPDATE flashcard
      SET status = 'miss'
      WHERE flashcard_id = ANY($1)
      `,
        [answerMiss])
    }
    return
  }
};
