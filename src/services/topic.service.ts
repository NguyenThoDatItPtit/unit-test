import { Topic } from "../models/topic.model";
import {query} from "../config/database"

const TopicService = {
    // Lấy toàn bộ tiêu đề
    async getAll(): Promise<Topic[]> {
        const result = await query(`SELECT * FROM topic ORDER BY topic_id`);
        return result.rows as Topic[];
    },
    
    async create(topic: Topic): Promise<Topic> {
        const result = await query(
            `INSERT INTO topic (title, description, subject_id)
             VALUES ($1, $2, $3) RETURNING *`,
            [topic.title, topic.description || null, topic.subject_id || null]
        );
        return result.rows[0] as Topic;
    },

    async update(id: number, topic: Partial<Omit<Topic, 'topic_id'>>): Promise<Topic> {
        const result = await query(
            `UPDATE topic
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 subject_id = COALESCE($3, subject_id)
             WHERE topic_id = $4
             RETURNING *`,
            [topic.title, topic.description, topic.subject_id, id]
        );
        if (!result.rows[0]) throw new Error('TOPIC_NOT_FOUND');
        return result.rows[0] as Topic;
    },

    async remove(id: number): Promise<void> {
        const result = await query(`DELETE FROM topic WHERE topic_id = $1`, [id]);
        if (result.rowCount === 0) throw new Error('TOPIC_NOT_FOUND');
    },
}

export default TopicService