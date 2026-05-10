import { query } from '../config/database';
import { User } from '../models/user.model';

const UserService = {
    // Lấy toàn bộ user
    async getAll(
        page: number,
        status: string,
        role: number | string,
        searchValue: string
    ): Promise<{ users: User[]; totalPages: number }> {
        const limit = 12;
        const offset = (page - 1) * limit;
        
        const params: any[] = [];
        let paramIndex = 1;

        let whereClause = `WHERE 1=1`;

        // ===== FILTER STATUS =====
        if (status && status !== "All") {
            whereClause += ` AND u.available = $${paramIndex}`;
            params.push(status === "true");
            paramIndex++;
        }

        // ===== FILTER ROLE =====
        if (role && role !== "All") {
            whereClause += ` AND r.role_id = $${paramIndex}`;
            params.push(role);
            paramIndex++;
        }

        // ===== SEARCH =====
        if (searchValue && searchValue.trim() !== "") {
            whereClause += `
            AND (
              unaccent(lower(u.user_name))
                ILIKE '%' || unaccent(lower($${paramIndex})) || '%'
              OR
              unaccent(lower(u.email))
                ILIKE '%' || unaccent(lower($${paramIndex})) || '%'
            )
          `;
            params.push(searchValue);
            paramIndex++;
        }

        // ===== QUERY CHÍNH =====
        const queryText = `
          SELECT
            u.user_id,
            u.user_name,
            u.email,
            u.birthday,
            u.created_at,
            u.available,
            r.role_name
          FROM "user" u
          JOIN "role" r ON r.role_id = u.role_id
          ${whereClause}
          ORDER BY u.user_id DESC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
        `;

        params.push(limit, offset);

        const result = await query(queryText, params);

        // ===== QUERY COUNT =====
        const countQuery = `
          SELECT COUNT(*) AS total
          FROM "user" u
          JOIN "role" r ON r.role_id = u.role_id
          ${whereClause}
        `;

        const countResult = await query(
            countQuery,
            params.slice(0, paramIndex - 1)
        );

        const totalItems = Number(countResult.rows[0].total);
        const totalPages = Math.ceil(totalItems / limit);

        return {
            users: result.rows as User[],
            totalPages,
        };
    },

    // Lấy user theo ID
    async getById(id: number): Promise<User> {
        const result = await query(`
        SELECT user_id, user_name, email, birthday, created_at, role_id, available
        FROM "user"
        WHERE user_id = $1`
            , [id]);
        if (!result.rows[0]) throw new Error('USER_NOT_FOUND');
        return result.rows[0] as User;
    },

    // Cập nhật user
    async update(id: number, user: Partial<Omit<User, 'user_id' | 'created_at'>>): Promise<User> {
        const result = await query(
            `UPDATE "user" 
            SET user_name = COALESCE($1, user_name),
             email = COALESCE($2, email),
             password_hash = COALESCE($3, password_hash),
             birthday = COALESCE($4, birthday),
             role_id = COALESCE($5, role_id),
             available = COALESCE($6, available)
            WHERE user_id = $7
            RETURNING user_id, user_name, email, birthday, created_at, available`,
            [user.user_name, user.email, user.password_hash, user.birthday, user.role_id, user.available, id]
        );
        if (!result.rows[0]) throw new Error('USER_NOT_FOUND');
        return result.rows[0] as User;
    },

    // Xóa user
    async remove(id: number): Promise<void> {
        const result = await query('DELETE FROM "user" WHERE user_id = $1', [id]);
        if (result.rowCount === 0) throw new Error('USER_NOT_FOUND');
    },
};

export default UserService;
