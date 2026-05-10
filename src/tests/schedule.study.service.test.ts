import StudyScheduleService from '../services/schedule.study.service';
import pool, { query } from '../config/database';

jest.mock('../config/database', () => {
  const mPool = {
    connect: jest.fn().mockReturnValue({
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
    }),
    query: jest.fn(),
  };
  return {
    __esModule: true,
    default: mPool,
    query: mPool.query,
  };
});

describe('ScheduleStudyService Unit Tests', () => {
  const mockQuery = query as jest.Mock;
  const mockPool = pool as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TC-SCHST-001: Lấy lịch học pending [CheckDB]
   */
  test('TC-SCHST-001: Lấy lịch học pending', async () => {
    const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [{ study_schedule_id: 1, status: 'pending' }] }),
        release: jest.fn(),
    };
    mockPool.connect.mockResolvedValueOnce(mockClient);

    const result = await StudyScheduleService.filter('pending');
    expect(result.schedule.length).toBeGreaterThan(0);
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining("s.status = $1"), ['pending']);
  });

  /**
   * TC-SCHST-002: Cập nhật trạng thái lịch học [CheckDB] [Rollback]
   */
  test('TC-SCHST-002: Cập nhật trạng thái lịch học', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ study_schedule_id: 1, status: 'done' }] });
    const result = await StudyScheduleService.update(1, { status: 'done' });
    expect(result?.status).toBe('done');
  });

  /**
   * TC-SCHST-003: Xóa trắng mô tả lịch học [CheckDB] [Rollback]
   * @bug Hàm update dùng COALESCE nên không thể set về null
   */
  test('TC-SCHST-003: Xóa trắng mô tả lịch học', async () => {
    // Giả sử dữ liệu cũ có description là 'Old'
    // Khi gọi update với description = null, COALESCE($2, description) sẽ trả về 'Old'
    mockQuery.mockResolvedValueOnce({ rows: [{ study_schedule_id: 1, description: 'Old' }] });
    
    const result = await StudyScheduleService.update(1, { description: null } as any);
    
    // Mong đợi description trở thành null, nhưng thực tế sẽ giữ nguyên 'Old'
    expect(result?.description).toBeNull();
  });

  /**
   * TC-SCHST-004: Múi giờ cứng (+7h) trong filter [CheckDB]
   * @bug Query cộng cứng 7h gây lỗi filter theo giờ
   */
  test('TC-SCHST-004: Múi giờ cứng (+7h) trong filter', async () => {
    const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
    };
    mockPool.connect.mockResolvedValueOnce(mockClient);

    await StudyScheduleService.getAll();
    
    // Kiểm tra xem query có chứa INTERVAL '7 hours' không
    const lastQuery = mockClient.query.mock.calls[1][0]; // 0: BEGIN, 1: SELECT
    
    // Mong đợi sử dụng UTC (không có cộng cứng), nhưng thực tế có '+ INTERVAL \'7 hours\''
    expect(lastQuery).not.toContain("INTERVAL '7 hours'");
  });

  /**
   * TC-SCHST-005: Đánh dấu quá hạn tự động [CheckDB]
   */
  test('TC-SCHST-005: Đánh dấu quá hạn tự động', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    await StudyScheduleService.markOverTime();
    // Query này được gọi trực tiếp với 1 tham số (string SQL)
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("status = 'miss'"));
  });
});
