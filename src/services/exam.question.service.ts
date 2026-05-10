import pool, { query } from "../config/database";
import { ExamQuestion } from "../models/exam.question.model";
import { redis } from "../config/redis";

export const ExamQuestionService = {
    async add(
        selectedQuestions: { exam_id: number; question_id: number }[]
    ) {
        if (!Array.isArray(selectedQuestions)) {
            throw new Error("selectedQuestions must be an array");
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const exam_id = selectedQuestions[0].exam_id;

            const newQuestionIds = selectedQuestions.map(q => q.question_id);

            // XOÁ các câu KHÔNG còn trong danh sách mới
            await client.query(
                `
            DELETE FROM question_exam
            WHERE exam_id = $1
              AND question_id NOT IN (${newQuestionIds.map((_, i) => `$${i + 2}`).join(",")})
            `,
                [exam_id, ...newQuestionIds]
            );

            // THÊM các câu MỚI
            const values: any[] = [];
            const placeholders = selectedQuestions
                .map((q, i) => {
                    values.push(q.exam_id, q.question_id);
                    return `($${i * 2 + 1}, $${i * 2 + 2})`;
                })
                .join(",");

            await client.query(
                `
            INSERT INTO question_exam (exam_id, question_id)
            VALUES ${placeholders}
            ON CONFLICT (exam_id, question_id) DO NOTHING
            `,
                values
            );

            await client.query("COMMIT");

            // XÓA CACHE – KHÔNG rebuild
            await redis.del(`exam:${exam_id}:full`);

            return {
                exam_id,
                total: newQuestionIds.length,
            };

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;

        } finally {
            client.release();
        }
    },

    async remove(data: ExamQuestion): Promise<boolean> {
        const result = await query(
            `DELETE FROM question_exam WHERE exam_id = $1 AND question_id = $2`,
            [data.exam_id, data.question_id]
        );
        // XÓA CACHE – KHÔNG rebuild
        await redis.del(`exam:${data.exam_id}:full`);
        return (result.rowCount ?? 0) > 0;
    }
}