import { query } from "../config/database";
import pool from "../config/database";
import { Question, CreateQuestionPayload } from "../models/question.model";

const QuestionService = {
    async get(question_ids: number[]): Promise<Question[]> {
        if (!question_ids || question_ids.length === 0) {
            return [];
        }

        const queryText = `SELECT q.* 
                            FROM question q 
                            WHERE question_id = ANY($1) AND available = true`;
        const result = await query(queryText, [question_ids]);
        return result.rows;
    },

    async getAll(
        page: number,
        status: string,
        searchValue: string,
        type_question?: number
    ): Promise<{ question: Question[]; totalPages: number }> {
        const limit = 12;
        const offset = (page - 1) * limit;

        const params: any[] = [];
        let paramIndex = 1;

        let whereClause = `WHERE 1=1`;       

        // ===== FILTER STATUS =====
        if (status && status !== "All") {
            whereClause += ` AND q.available = $${paramIndex}`;
            params.push(status );
            paramIndex++;
        }

        // ===== FILTER TYPE QUESTION =====
        if (type_question !== 0) {
            whereClause += ` AND q.type_question = $${paramIndex}`;
            params.push(type_question);
            paramIndex++;
        }

        // ===== SEARCH =====
        if (searchValue && searchValue.trim() !== "") {
            whereClause += `
                AND unaccent(lower(q.question_content))
                    ILIKE '%' || unaccent(lower($${paramIndex})) || '%'
                `;
            params.push(`%${searchValue}%`);
            paramIndex++;
        }

        // ===== QUERY CHÍNH =====
        const queryText = `
          SELECT
            q.*,
      
            -- ANSWERS
            COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'answer_id', a.answer_id,
                    'answer_content', a.answer_content,
                    'is_correct', a.is_correct,
                    'images',
                        COALESCE(
                        (
                            SELECT json_agg(ia.image_link)
                            FROM image_answer ia
                            WHERE ia.answer_id = a.answer_id
                        ),
                        '[]'
                        )
                  )
                )
                FROM answer a
                WHERE a.question_id = q.question_id
              ),
              '[]'
            ) AS answers,
      
            -- IMAGES
            COALESCE(
              (
                SELECT json_agg(iq.image_link)
                FROM image_question iq
                WHERE iq.question_id = q.question_id
              ),
              '[]'
            ) AS images
      
          FROM question q
          ${whereClause}
          ORDER BY q.question_id DESC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
        `;

        params.push(limit, offset);

        const result = await query(queryText, params);

        // ===== QUERY COUNT =====
        const countQuery = `
          SELECT COUNT(*) AS total
          FROM question q
          ${whereClause}
        `;

        const countResult = await query(
            countQuery,
            params.slice(0, paramIndex - 1)
        );

        const totalItems = Number(countResult.rows[0].total);
        const totalPages = Math.ceil(totalItems / limit);

        return {
            question: result.rows,
            totalPages,
        };
    },

    async create(payload: CreateQuestionPayload): Promise<Question> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");
            /* ================= QUESTION ================= */
            const qRes = await client.query(
                `
            INSERT INTO question (
              question_content,
              type_question,
              source,
              available
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
                [
                    payload.question_content,
                    payload.type_question ?? 1,
                    payload.source ?? "",
                    payload.available ?? true,
                ]
            );


            const question: Question = {
                ...qRes.rows[0],
                answers: [],
                images: [],
            };

            const questionId = question.question_id;

            /* ================= QUESTION IMAGES ================= */
            if (payload.images?.length) {
                for (const img of payload.images) {
                    await client.query(
                        `
                INSERT INTO image_question (question_id, image_link)
                VALUES ($1, $2)
                `,
                        [questionId, img]
                    );
                }

                question.images = payload.images;
            }

            /* ================= ANSWERS ================= */
            if (payload.answers?.length) {
                for (const ans of payload.answers) {

                    const aRes = await client.query(
                        `
                    INSERT INTO answer (
                    question_id,
                    answer_content,
                    is_correct
                    )
                    VALUES ($1, $2, $3)
                    RETURNING *
                    `,
                        [
                            questionId,
                            ans.answer_content,
                            ans.is_correct,
                        ]
                    );

                    const answer = {
                        ...aRes.rows[0],
                        images: [] as string[],
                    };

                    const answerId = answer.answer_id;

                    /* --- Insert answer images --- */
                    if (ans.images?.length) {
                        for (const img of ans.images) {
                            await client.query(
                                `
                                INSERT INTO image_answer (answer_id, image_link)
                                VALUES ($1, $2)
                                `,
                                [answerId, img]
                            );
                        }
                        answer.images = ans.images;
                    }

                    question.answers.push(answer);
                }
            }

            await client.query("COMMIT");
            return question;

        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    },

    // hàm update sẽ cập nhật cả question và answers
    async update(question_id: Number, question: Partial<Question>): Promise<Question | null> {
        const client = await pool.connect();
        try {
            const id = question_id;

            await client.query("BEGIN");

            // --- 1. Update question ---
            const allowed = ["question_name", "question_content"];
            const fields: string[] = [];
            const values: any[] = [];
            let idx = 1;

            for (const key of allowed) {
                if ((question as any)[key] !== undefined) {
                    fields.push(`${key} = $${idx}`);
                    values.push((question as any)[key]);
                    idx++;
                }
            }

            let updatedQuestion: Question | null = null;

            if (fields.length > 0) {
                values.push(id);
                const queryText = `
              UPDATE question 
              SET ${fields.join(", ")} 
              WHERE question_id = $${idx} 
              RETURNING *`;
                const result = await client.query(queryText, values);
                updatedQuestion = result.rows[0] || null;
            } else {
                const result = await client.query(
                    `SELECT * FROM question WHERE question_id = $1`,
                    [id]
                );
                updatedQuestion = result.rows[0] || null;
            }

            if (!updatedQuestion) {
                await client.query("ROLLBACK");
                return null;
            }

            // --- 2. Update answers (nếu có) ---
            if (question.answers && question.answers.length > 0) {
                for (const ans of question.answers) {
                    if (ans.answer_id) {
                        // update answer đã có
                        await client.query(
                            `UPDATE answer 
                   SET answer_content = $1, is_correct = $2 
                   WHERE answer_id = $3 AND question_id = $4`,
                            [ans.answer_content, ans.is_correct, ans.answer_id, id]
                        );
                    } else {
                        // thêm mới answer nếu answer đó không có answer_id
                        await client.query(
                            `INSERT INTO answer (question_id, answer_content, is_correct) 
                   VALUES ($1, $2, $3)`,
                            [id, ans.answer_content, ans.is_correct]
                        );
                    }
                }
            }

            // --- 3. Lấy lại toàn bộ question + answers ---
            const answersRes = await client.query(
                `SELECT * FROM answer WHERE question_id = $1`,
                [id]
            );
            updatedQuestion.answers = answersRes.rows;

            await client.query("COMMIT");
            return updatedQuestion;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    },

    async setAvailable(question_id: number, available: boolean): Promise<boolean> {
        const result = await query(
            `UPDATE question SET available = $1 WHERE question_id = $2`,
            [available, question_id]
        );
        return (result.rowCount ?? 0) > 0;
    },

    async remove(id: number): Promise<void> {
        const client = await pool.connect();
        try {
            const question_id = id;

            await client.query('BEGIN');

            // Xoá câu trả lời liên quan
            await client.query(
                'DELETE FROM answer WHERE question_id = $1',
                [question_id]
            );

            // Xoá câu hỏi
            await client.query(
                'DELETE FROM question WHERE question_id = $1',
                [question_id]
            );

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },
};

export default QuestionService;
