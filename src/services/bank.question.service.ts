import pool, { query } from "../config/database";
import { BankQuestion } from "../models/bank.question.model";


export const BankQuestionService = {
    async add(
        selectedQuestions: { bank_id: number; question_id: number }[]
    ) {
        if (!Array.isArray(selectedQuestions) || selectedQuestions.length === 0) {
            throw new Error("selectedQuestions is empty or invalid");
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const bank_id = selectedQuestions[0].bank_id;

            // Lấy danh sách question_id mới
            const newQuestionIds = selectedQuestions.map(q => q.question_id);

            // XOÁ các câu KHÔNG còn được chọn
            await client.query(
                `
            DELETE FROM question_bank
            WHERE bank_id = $1
              AND question_id NOT IN (${newQuestionIds.map((_, i) => `$${i + 2}`).join(",")})
            `,
                [bank_id, ...newQuestionIds]
            );

            //  THÊM các câu MỚI
            const values: any[] = [];
            const placeholders = selectedQuestions
                .map((q, i) => {
                    values.push(q.bank_id, q.question_id);
                    return `($${i * 2 + 1}, $${i * 2 + 2})`;
                })
                .join(",");

            await client.query(
                `
            INSERT INTO question_bank (bank_id, question_id)
            VALUES ${placeholders}
            ON CONFLICT (bank_id, question_id) DO NOTHING
            `,
                values
            );

            await client.query("COMMIT");

            return {
                bank_id,
                total: newQuestionIds.length,
            };

        } catch (err) {
            await client.query("ROLLBACK");
            throw err;

        } finally {
            client.release();
        }
    },

    async remove(data: BankQuestion): Promise<boolean> {
        const result = await query(
            `DELETE FROM question_bank WHERE bank_id = $1 AND question_id = $2`,
            [data.bank_id, data.question_id]
        );
        return (result.rowCount ?? 0) > 0;
    }
}