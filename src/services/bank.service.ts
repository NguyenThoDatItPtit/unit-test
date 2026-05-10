import pool, { query } from "../config/database";
import { Bank, DoBank } from "../models/bank.model";
import { Question } from "../models/question.model";
import { groupQuestionsByTypeSafe, QuestionGroup } from "../utils/helper";

const BankService = {
    async getById(
        bankId: number
    ): Promise<{
        question: QuestionGroup | null;
        subject_type: number | null;
    }> {

        const queryText = `
          SELECT
            q.*,
      
            -- IMAGE QUESTION
            COALESCE(
              (
                SELECT json_agg(iq.image_link)
                FROM image_question iq
                WHERE iq.question_id = q.question_id
              ),
              '[]'
            ) AS images,
      
            -- ANSWERS (CÓ is_correct – xử lý ở controller)
            COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'answer_id', a.answer_id,
                    'question_id', a.question_id,
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
            ) AS answers
      
          FROM bank b
          JOIN question_bank qb ON b.bank_id = qb.bank_id
          JOIN question q ON qb.question_id = q.question_id
          WHERE b.bank_id = $1
          ORDER BY qb.question_id ASC
        `;

        const questionResult = await query(queryText, [bankId]);

         const subjectTypeQuery = `
          SELECT s.subject_type
          FROM bank b
          JOIN topic t ON t.topic_id = b.topic_id
          JOIN subject s ON s.subject_id = t.subject_id
          WHERE b.bank_id = $1
        `;

        const subjectTypeResult = await query(subjectTypeQuery, [bankId]);
        
        const subject_type: number | null =
            subjectTypeResult.rows[0]?.subject_type ?? null;

        const groupedQuestions = groupQuestionsByTypeSafe(
            questionResult.rows as Question[]
        );

        // LẤY subject_type
        return {
            question: groupedQuestions,
            subject_type
        };
    },

    async listBank(
        page: number,
        status: string,
        searchValue: string,
        topicIds: number | "All",
        subject_id: number | "All"
    ): Promise<{ banks: Bank[]; totalPages: number }> {

        const limit = 12;
        const offset = (page - 1) * limit;

        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        // Search (bank description + topic title)
        if (searchValue.trim()) {
            conditions.push(`
            (
              unaccent(lower(b.description)) LIKE unaccent(lower($${idx}))
              OR
              unaccent(lower(t.title)) LIKE unaccent(lower($${idx}))
            )
          `);
            params.push(`%${searchValue}%`);
            idx++;
        }

        // Status
        if (status !== "All") {
            conditions.push(`b.available = $${idx}`);
            params.push(status === "true");
            idx++;
        }

        // Topic (CHỈ 1 topic)
        if (topicIds !== "All") {
            conditions.push(`b.topic_id = $${idx}`);
            params.push(topicIds);
            idx++;
        }

        // Subject
        if (subject_id !== "All") {
            conditions.push(`sj.subject_id = $${idx}`);
            params.push(subject_id);
            idx++;
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";
            
        // Query data
        const dataQuery = `
          SELECT
            b.*,
            t.title AS topic_name,
            sj.subject_type
          FROM bank b
          JOIN topic t ON b.topic_id = t.topic_id
          JOIN subject sj ON sj.subject_id = t.subject_id
          ${whereClause}
          ORDER BY b.bank_id DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        const dataResult = await query(dataQuery, params);
        
        // Count
        const countQuery = `
          SELECT COUNT(*) AS total
          FROM bank b
          JOIN topic t ON b.topic_id = t.topic_id
          JOIN subject sj ON sj.subject_id = t.subject_id
          ${whereClause}
        `;

        const [ countResult] = await Promise.all([
            query(countQuery, params),
        ]);
        
        return {
            banks: dataResult.rows,
            totalPages: Math.ceil(Number(countResult.rows[0].total) / limit),
        };
    },

    async create(bank: Bank): Promise<Bank> {
        const queryText = `
            INSERT INTO bank (description, topic_id, time_limit)
            VALUES ($1, $2, $3) RETURNING *`;
        const result = await query(queryText, [bank.description, bank.topic_id, bank.time_limit]);
        return result.rows[0];
    },

    async update(id: number, data: Bank): Promise<Bank | null> {
        const queryTextBase = 'UPDATE bank SET description = $1, topic_id = $2 WHERE bank_id = $3 RETURNING *';
        const result = await query(queryTextBase, [data.description, data.topic_id, id]);
        return result.rows[0] || null;
    },

    async submit(
        bank_id: number,
        user_id: number,
        do_bank: DoBank[],
        time_test: number,
        subject_type: number,
    ): Promise<{ score: number; history_bank_id: number }> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            //  Lấy đáp án đúng
            const { rows } = await client.query(
                `
            SELECT q.question_id, q.type_question, a.answer_id, a.answer_content
            FROM question_bank qb
            JOIN question q ON q.question_id = qb.question_id
            JOIN answer a ON a.question_id = q.question_id
            WHERE qb.bank_id = $1 AND a.is_correct = true
            `,
                [bank_id]
            );

            // Map đáp án
            const map = new Map<number, any>();
            for (const r of rows) {
                if (!map.has(r.question_id)) {
                    map.set(r.question_id, {
                        type_question: r.type_question,
                        correct_answers: [],
                        correct_text: undefined
                    });
                }
                const cur = map.get(r.question_id);
                r.type_question === 3
                    ? (cur.correct_text = r.answer_content)
                    : cur.correct_answers.push(r.answer_id);
            }

            //  Chấm điểm
            let score = 0;
            for (const user of do_bank) {
                const info = map.get(user.question_id);
                if (!info) continue;
                
                if (info.type_question === 1 &&
                    user.user_answer[0] == info.correct_answers[0]) {
                    score += 0.25;
                }
                else if (info.type_question === 2) {
                    const correct = user.user_answer.filter(
                        a => info.correct_answers.includes(Number(a))).length;
                    if (correct === 1) { score += 0.1 }
                    else if (correct === 2) { score += 0.25 }
                    else if (correct === 3) { score += 0.5 }
                    else score += 1;
                }
                if (info.type_question === 3 &&
                    String(user.user_answer[0]).trim().toLowerCase() ===
                    String(info.correct_text).trim().toLowerCase()) {
                    score += subject_type === 1 ? 0.5 : 0.25;
                }
            }

            // Insert history_exam (SAU khi có score)
            const historyResult = await client.query(
                `
            INSERT INTO history_bank (user_id, bank_id, score, time_test)
            VALUES ($1, $2, $3, $4)
            RETURNING history_bank_id
            `,
                [user_id, bank_id, score, time_test]
            );

            const history_bank_id = historyResult.rows[0].history_bank_id;

            // Insert user_exam_answer
            for (const user of do_bank) {
                for (const ans of user.user_answer) {

                    // TRẮC NGHIỆM
                    if (typeof ans === "number") {
                        await client.query(
                            `
                      INSERT INTO user_bank_answer
                      (history_bank_id, bank_id, user_id, question_id, answer_id, user_answer_text)
                      VALUES ($1, $2, $3, $4, $5, NULL)
                      `,
                            [
                                history_bank_id,
                                bank_id,
                                user_id,
                                user.question_id,
                                ans,
                            ]
                        );
                    }

                    // TỰ LUẬN
                    else if (typeof ans === "string") {
                        await client.query(
                            `
                      INSERT INTO user_bank_answer
                      (history_bank_id, bank_id, user_id, question_id, answer_id, user_answer_text)
                      VALUES ($1, $2, $3, $4, NULL, $5)
                      `,
                            [
                                history_bank_id,
                                bank_id,
                                user_id,
                                user.question_id,
                                ans,
                            ]
                        );
                    }
                }
            }

            await client.query("COMMIT");
            return { score, history_bank_id };

        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    },

    async getUserListBankHistory(
        user_id: number
    ): Promise<{
        history: {
            score: number;
            time_test: number;
            created_at: Date;
            description: String;
            history_bank_id: number
            bank_id: number
        }[];
    }> {
        try {
            const listQuery =
                `SELECT hb.score, hb.time_test, hb.created_at, b.description, hb.bank_id, hb.history_bank_id
                    FROM history_bank hb
                    JOIN bank b ON b.bank_id = hb.bank_id
                    WHERE hb.user_id=$1
                    ORDER BY history_bank_id DESC`
            const list = await query(listQuery, [user_id])
            if (!list || list.rows.length === 0) {
                return {
                    history: []
                };
            }

            return {
                history: list.rows
            };

        } catch (err) {
            console.error("Lỗi lấy lịch sử làm bài:", err);
            throw new Error("Không thể lấy lịch sử làm bài");
        }
    },

    async getUserAnswer(
        history_bank_id: number,
        bank_id: number
    ): Promise<{
        score: number | null;
        questions: Record<number, any[]>;
    }> {

        /* ================= SCORE ================= */
        const scoreResult = await pool.query(
            `SELECT score FROM history_bank WHERE history_bank_id = $1`,
            [history_bank_id]
        );
        const score = scoreResult.rows[0]?.score ?? null;

        /* ================= QUESTIONS + CORRECT ANSWERS ================= */
        const questionSql = `
          SELECT
            q.question_id,
            q.question_content,
            q.type_question,
    
            -- IMAGE QUESTION
            COALESCE(
              (
                SELECT json_agg(iq.image_link)
                FROM image_question iq
                WHERE iq.question_id = q.question_id
              ),
              '[]'
            ) AS images,
    
            json_agg(
              DISTINCT jsonb_build_object(
                'answer_id', a.answer_id,
                'answer_content', a.answer_content,
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
            ) FILTER (WHERE a.is_correct = true) AS correct_answers
      
          FROM question_bank qb
          JOIN question q ON q.question_id = qb.question_id
          LEFT JOIN answer a ON a.question_id = q.question_id
          WHERE qb.bank_id = $1
          GROUP BY q.question_id
          ORDER BY q.question_id
        `;
        const questionResult = await pool.query(questionSql, [bank_id]);

        /* ================= USER ANSWERS ================= */
        const userSql = `
          SELECT
            u.question_id,
            u.answer_id,
            u.user_answer_text,
            a.answer_content
          FROM user_bank_answer u
          LEFT JOIN answer a ON a.answer_id = u.answer_id
          WHERE u.history_bank_id = $1
        `;
        const userResult = await pool.query(userSql, [history_bank_id]);

        /* ================= MAP USER ANSWERS ================= */
        const userMap = new Map<number, {
            answer_id: number | null;
            answer_content: string | null;
        }[]>();

        for (const row of userResult.rows) {
            if (!userMap.has(row.question_id)) {
                userMap.set(row.question_id, []);
            }

            userMap.get(row.question_id)!.push({
                answer_id: row.answer_id ?? null,
                answer_content: row.answer_content ?? row.user_answer_text ?? null
            });
        }

        /* ================= GROUP BY TYPE QUESTION ================= */
        const grouped: Record<number, any[]> = { 1: [], 2: [], 3: [] };

        for (const q of questionResult.rows) {
            grouped[q.type_question].push({
                question_id: q.question_id,
                question_content: q.question_content,
                type_question: q.type_question,
                images: q.images ?? [],
                correct_answers: q.correct_answers ?? [],
                user_answers: userMap.get(q.question_id) ?? []
            });
        }

        return {
            score,
            questions: grouped
        };
    },

    async setAvailable(id: number, available: boolean): Promise<boolean> {
        const result = await query(
            "UPDATE bank SET available = $1 WHERE bank_id = $2",
            [available, id]
        );
        return (result.rowCount ?? 0) > 0;
    },

    async remove(id: number): Promise<boolean> {
        const queryText = 'DELETE FROM bank WHERE bank_id = $1';
        const result = await query(queryText, [id]);
        return (result.rowCount ?? 0) > 0;
    },

    async list(page: number, searchValue: string, topicIds: number[]): Promise<({ banks: Bank[]; totalPages: number }) | []> {

        const limit = 12;
        const offset = (page - 1) * limit;

        let conditions = [];
        let params = [];
        let idx = 1;

        // dieu kien loc bai luyen tap 
        conditions.push(`b.available = true`);

        // Search
        if (searchValue.trim() !== "") {
            conditions.push(`(LOWER(b.description) LIKE LOWER($${idx}))`);
            params.push(`%${searchValue}%`);
            idx++;
        }

        // Topic filter
        if (topicIds.length > 0) {
            conditions.push(`b.topic_id = ANY($${idx})`);
            params.push(topicIds);
            idx++;
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const queryText = `
                SELECT 
                    b.*,
                    t.title
                FROM bank b
                JOIN topic t ON b.topic_id = t.topic_id
                ${whereClause}
                ORDER BY b.bank_id DESC
                LIMIT ${limit} OFFSET ${offset}
                `;

        const result = await query(queryText, params);

        // Count total
        const countQuery = `
                SELECT COUNT(*) AS total
                FROM bank b
                ${whereClause}
                `;

        const countResult = await query(countQuery, params);

        const totalPages = Math.ceil(countResult.rows[0].total / limit);

        return { banks: result.rows, totalPages };
    },

    async getQuestionIdBank(bank_id: number): Promise<number[]> {
        const questionQuery = `SELECT question_id FROM question_bank WHERE bank_id=$1`
        const questionRows = await query(questionQuery, [bank_id])
        return questionRows.rows.map(
            (row: { question_id: number }) => row.question_id
        );
    },
};

export default BankService;