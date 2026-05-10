import { query } from '../config/database';
import { Role } from '../models/role.model';

const RoleService = {
  async getAll(): Promise<Role[]> {
    const result = await query('SELECT * FROM role ORDER BY role_id');
    return result.rows as Role[];
  },

  async getById(id: number): Promise<Role> {
    const result = await query('SELECT * FROM role WHERE role_id = $1', [id]);
    if (!result.rows[0]) {
      throw new Error('ROLE_NOT_FOUND');
    }
    return result.rows[0] as Role;
  },

  async create(role: Role): Promise<Role> {
    // kiểm tra role đã tồn tại
    const check = await query(
      'SELECT * FROM role WHERE role_name = $1',
      [role.role_name]
    );

    if (check.rows.length > 0) {
      throw new Error('ROLE_EXISTS');
    }

    // thêm mới
    const result = await query(
      'INSERT INTO role (role_name) VALUES ($1) RETURNING *',
      [role.role_name]
    );

    return result.rows[0] as Role;
  },

  async update(id: number, role: Partial<Role>): Promise<Role> {
    const result = await query(
      'UPDATE role SET role_name = COALESCE($1, role_name) WHERE role_id = $2 RETURNING *',
      [role.role_name, id]
    );
    if (!result.rows[0]) {
      throw new Error('ROLE_NOT_FOUND');
    }
    return result.rows[0] as Role;
  },

  async remove(id: number): Promise<void> {
    const result = await query('DELETE FROM role WHERE role_id = $1', [id]);
    if (result.rowCount === 0) {
      throw new Error('ROLE_NOT_FOUND');
    }
  },
};

export default RoleService;
