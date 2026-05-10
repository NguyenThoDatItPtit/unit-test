import { RoadMap } from "../models/roadmap.model";
import { query } from "../config/database";

const RoadMapService = {
    async getAll() : Promise<RoadMap[]> {
        const queryText = "SELECT * from roadmap_step ORDER BY roadmap_step_id"
        const result = await query(queryText);
        return result.rows
    },

    async getById(roadmap_step_id: number): Promise<RoadMap | null> {
        const queryTxt = "SELECT * FROM roadmap_step WHERE roadmap_step_id = $1 LIMIT 1";
        const result = await query(queryTxt, [roadmap_step_id]);
        return result.rows[0] || null;
    },

    // Tạo roadmap step
    async create(data: Omit<RoadMap, "roadmap_step_id">): Promise<RoadMap> {

        const queryTxt = `
            INSERT INTO roadmap_step (title, description, topic_id)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const params = [data.title, data.description, data.topic_id];

        const result = await query(queryTxt, params);
        return result.rows[0];
    },

    // Cập nhật roadmap step
    async update(roadmap_step_id: number, data: Partial<RoadMap>): Promise<RoadMap | null> {
        const queryTxt = `
            UPDATE roadmap_step
            SET 
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                topic_id = COALESCE($3, topic_id)
            WHERE roadmap_step_id = $4
            RETURNING *;
        `;

        const params = [
            data.title ?? null,
            data.description ?? null,
            data.topic_id ?? null,
            roadmap_step_id
        ];

        const result = await query(queryTxt, params);
        return result.rows[0] || null;
    },

    // Xoá roadmap step
    async delete(roadmap_step_id: number): Promise<boolean> {
        const queryTxt = "DELETE FROM roadmap_step WHERE roadmap_step_id = $1";
        const result = await query(queryTxt, [roadmap_step_id]);
        return (result.rowCount ?? 0) > 0;
    }
}

export default RoadMapService