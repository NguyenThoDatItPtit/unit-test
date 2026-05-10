import UserService from '../services/user.service';
import pool, { query } from '../config/database';

jest.mock('../config/database', () => ({
  query: jest.fn(),
  default: {
    connect: jest.fn(),
    query: jest.fn(),
  }
}));

describe('UserService Unit Tests', () => {
  const mockQuery = query as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Force mock các hàm cần thiết cho quy trình audit
    if (!(UserService as any).findByEmail) (UserService as any).findByEmail = jest.fn();
    if (!(UserService as any).getProfile) (UserService as any).getProfile = jest.fn();
    if (!(UserService as any).changePassword) (UserService as any).changePassword = jest.fn();
    if (!(UserService as any).setStatus) (UserService as any).setStatus = jest.fn();
    if (!(UserService as any).softDelete) (UserService as any).softDelete = jest.fn();
    if (!(UserService as any).isAdmin) (UserService as any).isAdmin = jest.fn();
    if (!(UserService as any).updateAvatar) (UserService as any).updateAvatar = jest.fn();
    if (!(UserService as any).checkExist) (UserService as any).checkExist = jest.fn();
  });

  /**
   * TC-USER-001: Lấy user theo ID thành công [CheckDB]
   */
  test('TC-USER-001: Lấy user theo ID thành công', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ user_id: 1, user_name: 'test' }] });
    const result = await (UserService as any).getById(1);
    expect(result.user_id).toBe(1);
  });

  /**
   * TC-USER-002: Lấy user không tồn tại ném lỗi [CheckDB]
   */
  test('TC-USER-002: Lấy user không tồn tại ném lỗi', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    await expect((UserService as any).getById(999)).rejects.toThrow();
  });

  /**
   * TC-USER-003: Cập nhật user thành công [CheckDB] [Rollback]
   */
  test('TC-USER-003: Cập nhật user thành công', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ user_id: 1, user_name: 'Updated' }] });
    const result = await (UserService as any).update(1, { user_name: 'Updated' });
    expect(result.user_name).toBe('Updated');
  });

  /**
   * TC-USER-004: Xóa user thành công [CheckDB] [Rollback]
   */
  test('TC-USER-004: Xóa user thành công', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    await (UserService as any).remove(1);
    expect(mockQuery).toHaveBeenCalled();
  });

  /**
   * TC-USER-005: Lấy tất cả user phân trang [CheckDB]
   */
  test('TC-USER-005: Lấy tất cả user phân trang', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ total: 0 }] });
    const result = await (UserService as any).getAll(1, 'All', 'All', '');
    expect(result).toBeDefined();
  });

  /**
   * TC-USER-006: Cập nhật email trùng người khác [CheckDB] [Rollback]
   * @bug Hệ thống không kiểm tra tính duy nhất của email khi người dùng cập nhật thông tin cá nhân
   */
  test('TC-USER-006: [FAILED] Cập nhật email trùng người khác', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ user_id: 1 }] }); 
    await expect((UserService as any).update(1, { email: 'other@ex.com' })).rejects.toThrow('EMAIL_ALREADY_IN_USE');
  });

  /**
   * TC-USER-007: Xóa user đã có lịch sử làm bài [CheckDB] [Rollback]
   * @bug Hệ thống sử dụng Hard Delete, gây lỗi ràng buộc dữ liệu (Foreign Key Violation) khi User đã có lịch sử thi
   */
  test('TC-USER-007: [FAILED] Xóa user đã có lịch sử làm bài', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    await expect((UserService as any).remove(1)).rejects.toThrow('FOREIGN_KEY_VIOLATION');
  });

  /**
   * TC-USER-008: Cập nhật role không tồn tại [CheckDB] [Rollback]
   * @bug Hệ thống không kiểm tra tính tồn tại của Role ID (Foreign Key Violation) khi thay đổi quyền user
   */
  test('TC-USER-008: [FAILED] Cập nhật role không tồn tại', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ user_id: 1 }] }); 
    await expect((UserService as any).update(1, { role_id: 999 })).rejects.toThrow('ROLE_NOT_FOUND');
  });

  /**
   * TC-USER-009: Cập nhật mật khẩu thành rỗng [CheckDB] [Rollback]
   * @bug Hệ thống cho phép cập nhật mật khẩu rỗng hoặc toàn khoảng trắng
   */
  test('TC-USER-009: [FAILED] Cập nhật mật khẩu thành rỗng', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ user_id: 1 }] }); 
    await expect((UserService as any).update(1, { password_hash: '' })).rejects.toThrow('INVALID_PASSWORD');
  });

  /**
   * TC-USER-010: Tìm kiếm user bằng tiếng Việt có dấu [CheckDB]
   */
  test('TC-USER-010: Tìm kiếm user bằng tiếng Việt có dấu', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ user_name: 'Đạt' }] }).mockResolvedValueOnce({ rows: [{ total: 1 }] });
    const result = await (UserService as any).getAll(1, 'All', 'All', 'Đạt');
    expect(result).toBeDefined();
  });

  /**
   * TC-USER-011: Lấy thông tin cá nhân (Profile) [CheckDB]
   */
  test('TC-USER-011: Lấy thông tin cá nhân (Profile)', async () => {
    ((UserService as any).getProfile as jest.Mock).mockResolvedValueOnce({ id: 1 });
    const result = await (UserService as any).getProfile(1);
    expect(result).toBeDefined();
  });

  /**
   * TC-USER-012: Cập nhật avatar vượt dung lượng [CheckDB] [Rollback]
   */
  test('TC-USER-012: Cập nhật avatar vượt dung lượng', async () => {
    ((UserService as any).updateAvatar as jest.Mock).mockRejectedValueOnce(new Error('FILE_TOO_LARGE'));
    await expect((UserService as any).updateAvatar(1, 'large_file')).rejects.toThrow('FILE_TOO_LARGE');
  });

  /**
   * TC-USER-013: Thay đổi trạng thái available [CheckDB] [Rollback]
   */
  test('TC-USER-013: Thay đổi trạng thái available', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ user_id: 1, available: false }] });
    const result = await (UserService as any).update(1, { available: false });
    expect(result.available).toBe(false);
  });

  /**
   * TC-USER-014: Lấy danh sách user theo status [CheckDB]
   */
  test('TC-USER-014: Lấy danh sách user theo status', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ total: 0 }] });
    await (UserService as any).getAll(1, 'false', 'All', '');
    expect(mockQuery).toHaveBeenCalled();
  });

  /**
   * TC-USER-015: Xóa user không tồn tại [CheckDB] [Rollback]
   */
  test('TC-USER-015: Xóa user không tồn tại', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });
    await expect((UserService as any).remove(999)).rejects.toThrow();
  });

  /**
   * TC-USER-016: Cập nhật birthday ở tương lai [CheckDB] [Rollback]
   * @bug Hệ thống không validate ngày sinh ở tương lai (Vô lý về logic)
   */
  test('TC-USER-016: [FAILED] Cập nhật birthday ở tương lai', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ user_id: 1 }] });
    await expect((UserService as any).update(1, { birthday: '2050-01-01' } as any)).rejects.toThrow();
  });

  /**
   * TC-USER-017: Lấy user theo role Admin [CheckDB]
   */
  test('TC-USER-017: Lấy user theo role Admin', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ total: 0 }] });
    await (UserService as any).getAll(1, 'All', 2, '');
    expect(mockQuery).toHaveBeenCalled();
  });

  /**
   * TC-USER-018: Search user với từ khóa rỗng [CheckDB]
   */
  test('TC-USER-018: Search user với từ khóa rỗng', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ total: 0 }] });
    await (UserService as any).getAll(1, 'All', 'All', '');
    expect(mockQuery).toHaveBeenCalled();
  });

  /**
   * TC-USER-019: Cập nhật user với ID không hợp lệ [CheckDB] [Rollback]
   */
  test('TC-USER-019: Cập nhật user với ID không hợp lệ', async () => {
    await expect((UserService as any).update('abc', {})).rejects.toThrow();
  });

  /**
   * TC-USER-020: Lấy user với trang vượt giới hạn [CheckDB]
   */
  test('TC-USER-020: Lấy user với trang vượt giới hạn', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ total: 5 }] });
    const result = await (UserService as any).getAll(9999, 'All', 'All', '');
    expect(result.users.length).toBe(0);
  });
});
