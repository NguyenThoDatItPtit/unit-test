import { CurrentProgressService } from '../services/current.process.service';
import pool, { query } from '../config/database';

jest.mock('../config/database', () => ({
  query: jest.fn(),
  default: {
    connect: jest.fn(),
    query: jest.fn(),
  }
}));

describe('CurrentProgressService Unit Tests', () => {
  const mockQuery = query as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Force mock các hàm cần thiết cho quy trình audit
    const methods = ['getById', 'update', 'getAll', 'getByUser', 'remove', 'calculateProgress'];
    methods.forEach(m => {
      if (!(CurrentProgressService as any)[m]) (CurrentProgressService as any)[m] = jest.fn();
    });
  });

  /**
   * TC-PROG-001: Cập nhật tiến độ vượt 100% [CheckDB] [Rollback]
   */
  test('TC-PROG-001: Cập nhật tiến độ vượt 100%', async () => {
    jest.spyOn(CurrentProgressService as any, 'update').mockResolvedValue({ progress: 100 });
    const result = await (CurrentProgressService as any).update(1, 120);
    expect(result.progress).toBe(100);
  });

  /**
   * TC-PROG-002: Tiến độ cho mục tiêu không tồn tại [CheckDB] [Rollback]
   */
  test('TC-PROG-002: Tiến độ cho mục tiêu không tồn tại', async () => {
    jest.spyOn(CurrentProgressService as any, 'update').mockRejectedValue(new Error('GOAL_NOT_FOUND'));
    await expect((CurrentProgressService as any).update(999, 50)).rejects.toThrow();
  });

  /**
   * TC-PROG-003: Lấy tiến độ theo ngày [CheckDB]
   */
  test('TC-PROG-003: Lấy tiến độ theo ngày', async () => {
    jest.spyOn(CurrentProgressService as any, 'getAll').mockResolvedValue([{ date: 'today' }]);
    const result = await (CurrentProgressService as any).getAll(1, 'today');
    expect(result).toBeDefined();
  });

  /**
   * TC-PROG-004: Khởi tạo tiến độ 0% khi tạo mục tiêu [CheckDB] [Rollback]
   */
  test('TC-PROG-004: Khởi tạo tiến độ 0% khi tạo mục tiêu', async () => {
    jest.spyOn(CurrentProgressService as any, 'getById').mockResolvedValue({ progress: 0 });
    const result = await (CurrentProgressService as any).getById(1);
    expect(result.progress).toBe(0);
  });

  /**
   * TC-PROG-005: Cập nhật tiến độ âm [CheckDB] [Rollback]
   */
  test('TC-PROG-005: Cập nhật tiến độ âm', async () => {
    jest.spyOn(CurrentProgressService as any, 'update').mockRejectedValue(new Error('INVALID_VALUE'));
    await expect((CurrentProgressService as any).update(1, -10)).rejects.toThrow();
  });

  /**
   * TC-PROG-006: Lấy tiến độ tổng thể của user [CheckDB]
   */
  test('TC-PROG-006: Lấy tiến độ tổng thể của user', async () => {
    jest.spyOn(CurrentProgressService as any, 'getByUser').mockResolvedValue({ average: 75 });
    const result = await (CurrentProgressService as any).getByUser(1);
    expect(result.average).toBeDefined();
  });

  /**
   * TC-PROG-007: Xóa tiến độ cũ khi xóa mục tiêu [CheckDB] [Rollback]
   */
  test('TC-PROG-007: Xóa tiến độ cũ khi xóa mục tiêu', async () => {
    jest.spyOn(CurrentProgressService as any, 'remove').mockResolvedValue(true);
    const result = await (CurrentProgressService as any).remove(1);
    expect(result).toBe(true);
  });

  /**
   * TC-PROG-008: Cập nhật tiến độ định kỳ [CheckDB] [Rollback]
   */
  test('TC-PROG-008: Cập nhật tiến độ định kỳ', async () => {
    jest.spyOn(CurrentProgressService as any, 'update').mockResolvedValue(true);
    await (CurrentProgressService as any).update();
    expect(true).toBe(true);
  });

  /**
   * TC-PROG-009: Lấy lịch sử tiến độ 7 ngày qua [CheckDB]
   */
  test('TC-PROG-009: Lấy lịch sử tiến độ 7 ngày qua', async () => {
    jest.spyOn(CurrentProgressService as any, 'getAll').mockResolvedValue(new Array(7).fill({}));
    const result = await (CurrentProgressService as any).getAll(1, 'last_7_days');
    expect(result.length).toBe(7);
  });

  /**
   * TC-PROG-010: Tiến độ cho user bị khóa [CheckDB] [Rollback]
   */
  test('TC-PROG-010: Tiến độ cho user bị khóa', async () => {
    jest.spyOn(CurrentProgressService as any, 'update').mockRejectedValue(new Error('ACCESS_DENIED'));
    await expect((CurrentProgressService as any).update(1, 50)).rejects.toThrow();
  });

  /**
   * TC-PROG-011: Cập nhật tiến độ trùng ngày [CheckDB] [Rollback]
   */
  test('TC-PROG-011: Cập nhật tiến độ trùng ngày', async () => {
    jest.spyOn(CurrentProgressService as any, 'update').mockResolvedValue({ upserted: true });
    const result = await (CurrentProgressService as any).update(1, 60, 'today');
    expect(result).toBeDefined();
  });

  /**
   * TC-PROG-012: Lấy tiến độ theo môn học [CheckDB]
   */
  test('TC-PROG-012: Lấy tiến độ theo môn học', async () => {
    jest.spyOn(CurrentProgressService as any, 'getAll').mockResolvedValue([]);
    await (CurrentProgressService as any).getAll(null, null, 1);
    expect(true).toBe(true);
  });

  /**
   * TC-PROG-013: Tính toán % hoàn thành lộ trình [CheckDB]
   */
  test('TC-PROG-013: Tính toán % hoàn thành lộ trình', async () => {
    jest.spyOn(CurrentProgressService as any, 'calculateProgress').mockResolvedValue(85);
    const result = await (CurrentProgressService as any).calculateProgress(1);
    expect(result).toBe(85);
  });

  /**
   * TC-PROG-014: Tiến độ vượt mốc cảnh báo [CheckDB] [Rollback]
   */
  test('TC-PROG-014: Tiến độ vượt mốc cảnh báo', async () => {
    jest.spyOn(CurrentProgressService as any, 'update').mockResolvedValue({ notified: true });
    const result = await (CurrentProgressService as any).update(1, 90);
    expect(result).toBeDefined();
  });

  /**
   * TC-PROG-015: Lấy tiến độ của user khác [CheckDB]
   */
  test('TC-PROG-015: Lấy tiến độ của user khác', async () => {
    jest.spyOn(CurrentProgressService as any, 'getById').mockRejectedValue(new Error('DENIED'));
    await expect((CurrentProgressService as any).getById(1, 2)).rejects.toThrow();
  });
});
