import { query } from "../config/database"
import { UserGoal } from "../models/user.goal.models"

export const UserGoalService = {
    async getAll(userId: number): Promise<UserGoal[]> {
        const result = await query(
            `SELECT 
                ug.*,
                s.subject_name,
                MAX(he.score) AS max_score
            FROM user_goal ug
            JOIN subject s 
                ON s.subject_id = ug.subject_id
            LEFT JOIN exam e 
                ON e.topic_id IS NULL 
                OR e.topic_id IN (
                    SELECT t.topic_id FROM topic t WHERE t.subject_id = ug.subject_id
                )
            LEFT JOIN history_exam he 
                ON he.exam_id = e.exam_id
                AND he.user_id = ug.user_id
            WHERE 
                ug.user_id = $1
            GROUP BY 
                ug.user_goal_id, s.subject_name
            ORDER BY 
                ug.deadline DESC;
            `,
            [userId]
        );
        return result.rows;
    },

    async create(goal: UserGoal): Promise<UserGoal> {

        const result = await query(
            `INSERT INTO user_goal (target_score, deadline, user_id, subject_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [Number(goal.target_score), goal.deadline, goal.user_id, Number(goal.subject_id)]
        );

        return result.rows[0];
    },

    async delete(id: number, userId: number): Promise<boolean> {
        await query(
            `DELETE FROM user_goal WHERE user_goal_id = $1 AND user_id = $2`,
            [id, userId]
        );
        return true;
    },

    async markOverTime() {
        try {

            const row = await query(`
                UPDATE user_goal
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
