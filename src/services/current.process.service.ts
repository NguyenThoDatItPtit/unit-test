import { CurrentProgress } from "../models/current.proces.model";
import { query } from "../config/database"; 

export class CurrentProgressService {
    static async create(progress: CurrentProgress): Promise<CurrentProgress> {
        const { current_progress, user_id } = progress;

        const result = await query(
            `INSERT INTO current_progress (current_progress, user_id)
             VALUES ($1, $2)
             RETURNING *`,
            [current_progress, user_id]
        );

        return result.rows[0];
    }

    static async getByUserGoal(user_id: number): Promise<CurrentProgress[]> {
        const result = await query(
            `SELECT * FROM current_progress WHERE user_id = $1 ORDER BY created_at ASC`,
            [user_id]
        );
        return result.rows;
    }

    static async getById(current_progress_id: number): Promise<CurrentProgress | null> {
        const result = await query(
            `SELECT * FROM current_progress WHERE current_progress_id = $1`,
            [current_progress_id]
        );
        return result.rows[0] || null;
    }

    static async delete(current_progress_id: number): Promise<void> {
        await query(
            `DELETE FROM current_progress WHERE current_progress_id = $1`,
            [current_progress_id]
        );
    }
}
