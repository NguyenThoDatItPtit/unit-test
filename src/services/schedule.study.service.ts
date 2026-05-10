import pool, { query } from "../config/database";
import { StudySchedule } from "../models/schedule.study.model";

const StudyScheduleService = {
    async getAll(): Promise<{ schedule: (StudySchedule & { subject_name: string })[] }> {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            // Lấy dữ liệu phân trang
            const queryText = `
            SELECT s.*, sub.subject_name
            FROM study_schedule s
            LEFT JOIN subject sub ON s.subject_id = sub.subject_id
            WHERE s.status IN ('pending')
                AND (s.end_time IS NULL OR s.end_time >= (NOW() + INTERVAL '7 hours'))
            ORDER BY s.start_time DESC
            `;
            const result = await client.query(queryText);

            await client.query("COMMIT");

            return { schedule: result.rows };
        } catch (error) {
            await client.query("ROLLBACK");
            console.error("Lỗi khi lấy lịch học:", error);
            return { schedule: []};
        } finally {
            client.release();
        }
    },

    async getById(id: number): Promise<StudySchedule | null> {
        const queryText = "SELECT * FROM study_schedule WHERE study_schedule_id = $1 LIMIT 1";
        const result = await query(queryText, [id]);
        return result.rows[0] || null;
    },

    async create(data: Omit<StudySchedule, "study_schedule_id" | "created_at" | "update_at">): Promise<StudySchedule> {
        const queryText = `
        INSERT INTO study_schedule 
            (title, description, start_time, end_time, status, target_question, subject_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *;
        `;
        const params = [
            data.title,
            data.description ?? null,
            data.start_time ?? null,
            data.end_time ?? null,
            data.status ?? 'pending',
            data.target_question ?? null,
            data.subject_id ?? null
        ];
        const result = await query(queryText, params);
        return result.rows[0];
    },

    async update(id: number, data: Partial<Omit<StudySchedule, "study_schedule_id">>): Promise<StudySchedule | null> {
        
        const queryText = `
            UPDATE study_schedule
            SET 
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                start_time = COALESCE($3, start_time),
                end_time = COALESCE($4, end_time),
                status = COALESCE($5, status),
                target_question = COALESCE($6, target_question),
                subject_id = COALESCE($7, subject_id),
                update_at = now()
            WHERE study_schedule_id = $8
            RETURNING *;
            `;
        const params = [
            data.title ?? null,
            data.description ?? null,
            data.start_time ?? null,
            data.end_time ?? null,
            data.status ?? null,
            data.target_question ?? null,
            data.subject_id ?? null,
            id
        ];
        const result = await query(queryText, params);
        return result.rows[0] || null;
    },

    async delete(id: number): Promise<boolean> {
        const queryText = "DELETE FROM study_schedule WHERE study_schedule_id = $1";
        const result = await query(queryText, [id]);
        return (result.rowCount ?? 0) > 0;
    },

    async filter( 
            status?: string,
    ): Promise<{ schedule: (StudySchedule & { subject_name: string })[]}> {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
    
            //Danh sách điều kiện
            const where: string[] = [];
            const params: any[] = []
            
            //Thêm điều kiện động 
            if (status) {
                params.push(status);
                where.push(`s.status = $${params.length}`);
            }
    
            if (where.length === 0) {
                where.push(`(s.end_time IS NULL OR s.end_time >= (NOW() + INTERVAL '7 hours'))`);
            }
            
            const whereSQL = "WHERE " + where.join(" AND ");
    
            // Query chính
            const queryText = `
                SELECT s.*, sub.subject_name
                FROM study_schedule s
                LEFT JOIN subject sub ON s.subject_id = sub.subject_id
                ${whereSQL}
                ORDER BY s.start_time DESC
            `;
    
            const result = await client.query(queryText, [...params]);
            
            await client.query("COMMIT");
    
            return { schedule: result.rows };
        } catch (error) {
            await client.query("ROLLBACK");
            console.error("Lỗi khi filter:", error);
            return { schedule: []};
        } finally {
            client.release();
        }
    },    

    async markOverTime() {
        try {

            const row = await query(`
                UPDATE study_schedule
                SET status = 'miss'
                WHERE end_time < (NOW() + INTERVAL '7 hours')
                  AND status != 'done'
                  AND status != 'miss';
            `);

        } catch (err) {
            console.error("Lỗi khi cập nhật lịch quá hạn:", err);
        }
    }

};

export default StudyScheduleService;
