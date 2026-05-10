import { query } from "../config/database";
import { ScheduleExam } from "../models/schedule.exam.model";

export const ScheduleExamService = {
        //  Lấy danh sách tất cả lịch thi (có phân trang)
        async getAll(page?: number): Promise<{
                schedules: ScheduleExam[];
                totalPages: number;
        }> {
                const isPaging = Number.isInteger(page) && page! > 0;

                const now = new Date();
                now.setHours(now.getHours() + 7);

                const limit = 10;
                const offset = isPaging ? (page! - 1) * limit : 0;

                let dataQuery = `
                  SELECT
                    es.exam_schedule_id,
                    es.start_time,
                    es.end_time,
                    es.created_at,
                    es.updated_at,
                    COUNT(e.exam_id) AS total_exams
                  FROM exam_schedule es
                  LEFT JOIN exam e
                    ON e.exam_schedule_id = es.exam_schedule_id
                  GROUP BY
                    es.exam_schedule_id,
                    es.start_time,
                    es.end_time,
                    es.created_at,
                    es.updated_at
                  ORDER BY
                    CASE
                      WHEN es.start_time <= $1 AND es.end_time >= $1 THEN 1
                      WHEN es.start_time > $1 THEN 2
                      ELSE 3
                    END ASC,
                    es.end_time ASC
                `;

                const params: any[] = [now];

                if (isPaging) {
                        dataQuery += ` LIMIT $2::int OFFSET $3::int`;
                        params.push(limit, offset);
                }

                const dataResult = await query(dataQuery, params);

                const countQuery = `SELECT COUNT(*)::int AS total FROM exam_schedule`;
                const countResult = await query(countQuery);
                const totalRecords = countResult.rows[0].total;

                const totalPages = isPaging ? Math.ceil(totalRecords / limit) : 1;

                return {
                        schedules: dataResult.rows as ScheduleExam[],
                        totalPages,
                };
        },

        //  Lấy lịch thi theo ID + danh sách đề thi
        async getById(
                id: number,
                page: number = 1,
                limit: number = 10
        ): Promise<ScheduleExam | null> {

                const offset = (page - 1) * limit;

                /* 1. LẤY TOTAL EXAMS */
                const countQuery = `
                  SELECT COUNT(*) 
                  FROM exam 
                  WHERE exam_schedule_id = $1
                `;
                const countResult = await query(countQuery, [id]);
                const totalItems = Number(countResult.rows[0].count);
                const totalPages = Math.max(1, Math.ceil(totalItems / limit));

                /* 2. LẤY DANH SÁCH EXAMS (CÓ LIMIT) */
                const examQuery = `
                  SELECT 
                    e.exam_name,
                    e.topic_id,
                    e.time_limit,
                    e.exam_id,
                    e.created_at,
                    t.title
                  FROM exam e
                  JOIN topic t ON t.topic_id = e.topic_id
                  WHERE e.exam_schedule_id = $1
                  ORDER BY e.created_at DESC
                  LIMIT $2 OFFSET $3
                `;
                const examResult = await query(examQuery, [id, limit, offset]);

                /* 3. LẤY THÔNG TIN SCHEDULE */
                const scheduleQuery = `
                  SELECT * FROM exam_schedule WHERE exam_schedule_id = $1
                `;
                const scheduleResult = await query(scheduleQuery, [id]);
                const schedule = scheduleResult.rows[0];

                if (!schedule) return null;

                /* 4. GHÉP DATA */
                return {
                        ...schedule,
                        exams: examResult.rows,
                        totalPages,
                        currentPage: page,
                } as ScheduleExam;
        },

        //  Tạo mới lịch thi
        async create(data: ScheduleExam): Promise<ScheduleExam> {

                const queryText = `
                INSERT INTO exam_schedule (start_time, end_time)
                VALUES ($1, $2)
                RETURNING *`;
                const result = await query(queryText, [
                        data.start_time,
                        data.end_time
                ]);
                return result.rows[0];
        },

        //  Cập nhật lịch thi
        async update(id: number, data: ScheduleExam): Promise<ScheduleExam | null> {
                const queryText = `
                UPDATE exam_schedule
                SET     
                start_time = $1, 
                end_time = $2
                WHERE exam_schedule_id = $3
                RETURNING *`;
                const result = await query(queryText, [
                        data.start_time,
                        data.end_time,
                        id
                ]);
                return result.rows[0] || null;
        },

        //  Xoá lịch thi
        async remove(id: number): Promise<boolean> {
                const result = await query(
                        "DELETE FROM exam_schedule WHERE exam_schedule_id = $1",
                        [id]
                );
                return (result.rowCount ?? 0) > 0;
        },
};


