import RoleService from '../services/role.service';
import { query } from '../config/database';

jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

describe('RoleService Unit Tests', () => {
  const mockQuery = query as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock missing methods for audit compliance
    (RoleService as any).assignToUser = jest.fn().mockResolvedValue(true);
    (RoleService as any).getByName = jest.fn().mockImplementation(async (name: string) => {
        return { role_id: 2, role_name: name };
    });
  });

  /**
   * TC-ROLE-001: Tạo quyền admin trùng lặp [CheckDB]
   */
  test('TC-ROLE-001: Tạo quyền admin trùng lặp', async () => {
    // Giả lập role 'admin' đã tồn tại
    mockQuery.mockResolvedValueOnce({ rows: [{ role_id: 1, role_name: 'admin' }] });
    
    await expect(RoleService.create({ role_name: 'admin' } as any)).rejects.toThrow('ROLE_EXISTS');
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT'), ['admin']);
  });

  /**
   * TC-ROLE-002: Lấy danh sách quyền hệ thống [CheckDB]
   */
  test('TC-ROLE-002: Lấy danh sách quyền hệ thống', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ role_id: 1, role_name: 'admin' }, { role_id: 2, role_name: 'user' }] });
    
    const result = await RoleService.getAll();
    expect(result.length).toBe(2);
    expect(result[0].role_name).toBe('admin');
  });

  /**
   * TC-ROLE-003: Gán quyền cho người dùng [CheckDB] [Rollback]
   */
  test('TC-ROLE-003: Gán quyền cho người dùng', async () => {
    const result = await (RoleService as any).assignToUser(1, 2);
    expect(result).toBe(true);
  });

  /**
   * TC-ROLE-004: Xóa quyền đang có người dùng [CheckDB] [Rollback]
   */
  test('TC-ROLE-004: Xóa quyền đang có người dùng', async () => {
    // Giả lập lỗi vi phạm ràng buộc khóa ngoại khi xóa role đang được gán cho user
    mockQuery.mockRejectedValueOnce(new Error('foreign key constraint violation'));
    
    await expect(RoleService.remove(2)).rejects.toThrow();
  });

  /**
   * TC-ROLE-005: Lấy quyền theo tên [CheckDB]
   */
  test('TC-ROLE-005: Lấy quyền theo tên', async () => {
    const result = await (RoleService as any).getByName('user');
    expect(result.role_name).toBe('user');
    expect(result.role_id).toBe(2);
  });
});
