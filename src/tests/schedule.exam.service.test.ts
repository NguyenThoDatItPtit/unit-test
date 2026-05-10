import { ScheduleExamService } from '../services/schedule.exam.service';
import { query } from '../config/database';

jest.mock('../config/database', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
  };
  return {
    __esModule: true,
    default: mPool,
    query: mPool.query,
  };
});

describe('ScheduleExamService Unit Tests', () => {
  const mockQuery = query as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TC-SCHEX-001: Lấy danh sách lịch thi [CheckDB]
   */
  test('TC-SCHEX-001: Lấy danh sách lịch thi', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ exam_schedule_id: 1, start_time: new Date(), end_time: new Date() }] }) // dataResult
      .mockResolvedValueOnce({ rows: [{ total: 1 }] }); // countResult

    const result = await ScheduleExamService.getAll(1);
    expect(result.schedules.length).toBeGreaterThan(0);
    expect(result.totalPages).toBe(1);
  });

  /**
   * TC-SCHEX-002: Tạo lịch thi thành công [CheckDB] [Rollback]
   */
  test('TC-SCHEX-002: Tạo lịch thi thành công', async () => {
    const mockSchedule = { start_time: new Date(), end_time: new Date() };
    mockQuery.mockResolvedValueOnce({ rows: [{ ...mockSchedule, exam_schedule_id: 1 }] });
    
    const result = await ScheduleExamService.create(mockSchedule as any);
    expect(result.exam_schedule_id).toBe(1);
  });

  /**
   * TC-SCHEX-003: Tạo lịch thi kết thúc trước bắt đầu [CheckDB] [Rollback]
   * @bug Hệ thống cho phép end_time < start_time
   */
  test('TC-SCHEX-003: Tạo lịch thi kết thúc trước bắt đầu', async () => {
    const invalidData = { 
        start_time: new Date('2026-01-01T10:00:00'), 
        end_time: new Date('2026-01-01T09:00:00') 
    };
    
    // Mong đợi ném lỗi INVALID_TIME, nhưng thực tế sẽ thực hiện INSERT thành công
    // Nếu không ném lỗi, expect(call).toThrow() sẽ thất bại (Test FAIL - đúng yêu cầu)
    const call = () => ScheduleExamService.create(invalidData as any);
    await expect(call()).rejects.toThrow('INVALID_TIME');
  });

  /**
   * TC-SCHEX-004: Múi giờ cứng trong query (+7h) [CheckDB]
   * @bug Query cộng cứng 7h gây sai lệch múi giờ server
   */
  test('TC-SCHEX-004: Múi giờ cứng trong query (+7h)', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });

    await ScheduleExamService.getAll();
    
    // Kiểm tra xem query có được gọi với tham số thời gian đã bị cộng 7h không
    const calledDate = mockQuery.mock.calls[0][1][0] as Date;
    const now = new Date();
    // Nếu chênh lệch ~7 tiếng so với hiện tại, nghĩa là code có bug hardcode +7
    const hourDiff = Math.round((calledDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    // Mong đợi sử dụng UTC (chênh lệch 0), nhưng thực tế sẽ là 7
    expect(hourDiff).toBe(0);
  });

  /**
   * TC-SCHEX-005: Xóa lịch thi đang có bài thi [CheckDB] [Rollback]
   */
  test('TC-SCHEX-005: Xóa lịch thi đang có bài thi', async () => {
    // Giả lập lỗi vi phạm ràng buộc khóa ngoại khi xóa lịch thi đang được đề thi tham chiếu
    mockQuery.mockRejectedValueOnce(new Error('foreign key constraint violation'));
    
    await expect(ScheduleExamService.remove(1)).rejects.toThrow();
  });
});
