import { UserGoalService } from '../services/user.goal.service';
import { query } from '../config/database';

jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

describe('UserGoalService Unit Tests', () => {
  const mockQuery = query as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TC-GOAL-001: Lấy mục tiêu người dùng [CheckDB]
   */
  test('TC-GOAL-001: Lấy mục tiêu người dùng', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ user_goal_id: 1, subject_name: 'Math', max_score: 9 }] });
    const result = await UserGoalService.getAll(1);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('max_score');
  });

  /**
   * TC-GOAL-002: Tạo mục tiêu học tập [CheckDB] [Rollback]
   */
  test('TC-GOAL-002: Tạo mục tiêu học tập', async () => {
    const mockGoal = { target_score: 9, deadline: new Date(), user_id: 1, subject_id: 1 };
    mockQuery.mockResolvedValueOnce({ rows: [{ ...mockGoal, user_goal_id: 1 }] });
    
    const result = await UserGoalService.create(mockGoal as any);
    expect(result.user_goal_id).toBe(1);
  });

  /**
   * TC-GOAL-003: Tạo mục tiêu đã quá hạn [CheckDB] [Rollback]
   * @bug Hệ thống cho phép tạo mục tiêu quá hạn
   */
  test('TC-GOAL-003: Tạo mục tiêu đã quá hạn', async () => {
    const pastGoal = { 
        target_score: 9, 
        deadline: new Date('2020-01-01'), 
        user_id: 1, 
        subject_id: 1 
    };
    
    // Mong đợi ném lỗi INVALID_DEADLINE, nhưng thực tế sẽ thực hiện INSERT thành công
    const call = () => UserGoalService.create(pastGoal as any);
    await expect(call()).rejects.toThrow('INVALID_DEADLINE');
  });

  /**
   * TC-GOAL-004: Lỗi tên cột trong markOverTime [CheckDB]
   * @bug Query dùng 'end_time' thay vì 'deadline' (Lỗi Schema)
   */
  test('TC-GOAL-004: Lỗi tên cột trong markOverTime', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });
    
    await UserGoalService.markOverTime();
    
    // Kiểm tra query SQL
    const lastQuery = mockQuery.mock.calls[0][0];
    
    // Mong đợi sử dụng cột 'deadline', nhưng thực tế sử dụng 'end_time'
    expect(lastQuery).toContain('deadline');
    expect(lastQuery).not.toContain('end_time');
  });

  /**
   * TC-GOAL-005: Xóa mục tiêu của người khác [CheckDB] [Rollback]
   */
  test('TC-GOAL-005: Xóa mục tiêu của người khác', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });
    
    // Giả sử xóa goal_id=1 của user_id=2
    await UserGoalService.delete(1, 2);
    
    // Kiểm tra WHERE clause có chứa cả 2 điều kiện để đảm bảo tính sở hữu
    expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_goal_id = $1 AND user_id = $2'),
        [1, 2]
    );
  });
});
