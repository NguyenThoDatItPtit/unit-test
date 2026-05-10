import pool, { query } from "../config/database";
import { Subject } from "../models/subject.model";

const SubjectService = {
    async getAll(limit: number = 100, offset: number = 0): Promise<Subject[]> {
        const queryText = 'SELECT * FROM subject WHERE available = true ORDER BY subject_id LIMIT $1 OFFSET $2';
        const result = await query(queryText, [limit, offset]);

        return result.rows;
    },

    async create(subject: Subject): Promise<Subject> {
        const result = await query('INSERT INTO subject (subject_name, subject_type) VALUES ($1, $2) RETURNING *', [subject.subject_name, subject.subject_type]);
        return result.rows[0];
    },

    async update(id: number, subject: Subject): Promise<Subject> {
        const result = await query('UPDATE subject SET subject_name = $1 WHERE subject_id = $2 RETURNING *', [subject.subject_name, id]);
        return result.rows[0];
    },

    async setAvailable(id: number, available: boolean): Promise<boolean> {
        const result = await query('UPDATE subject SET available = $1 WHERE subject_id = $2', [available, id]);
        return (result.rowCount ?? 0) > 0;
    },

    async remove(id: number): Promise<void> {
        await query('DELETE FROM topic WHERE subject_id = $1', [id]);
        await query('DELETE FROM subject WHERE subject_id = $1', [id]);
    }
}

export default SubjectService;