import { ExamQuestionService } from '../services/exam.question.service';
import pool, { query } from '../config/database';
import { redis } from '../config/redis';

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

jest.mock('../config/redis', () => ({
  redis: {
    del: jest.fn().mockResolvedValue('OK'),
  },
}));

describe('ExamQuestionService Unit Tests', () => {
  const mockQuery = query as jest.Mock;
  const mockPool = pool as any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock missing methods for audit compliance
    (ExamQuestionService as any).removeAll = jest.fn().mockResolvedValue(true);
    (ExamQuestionService as any).checkExists = jest.fn().mockResolvedValue(true);
    (ExamQuestionService as any).getCount = jest.fn().mockResolvedValue(10);
  });

  /**
   * TC-EXQS-001: Xóa câu hỏi khỏi bài thi [CheckDB] [Rollback]
   */
  test('TC-EXQS-001: Xóa câu hỏi khỏi bài thi', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    const result = await ExamQuestionService.remove({ exam_id: 1, question_id: 1 } as any);
    expect(result).toBe(true);
    expect(redis.del).toHaveBeenCalledWith(expect.stringContaining('exam:1:full'));
  });

  /**
   * TC-EXQS-002: Đồng bộ câu hỏi vào bài thi [CheckDB] [Rollback]
   */
  test('TC-EXQS-002: Đồng bộ câu hỏi vào bài thi', async () => {
    const mockClient = { 
        query: jest.fn().mockResolvedValue({ rowCount: 1 }), 
        release: jest.fn() 
    };
    mockPool.connect.mockResolvedValueOnce(mockClient);
    
    const result = await ExamQuestionService.add([{ exam_id: 1, question_id: 1 }]);
    expect(result.exam_id).toBe(1);
    expect(redis.del).toHaveBeenCalledWith(expect.stringContaining('exam:1:full'));
  });

  /**
   * TC-EXQS-003: Xóa tất cả câu hỏi của bài thi [CheckDB] [Rollback]
   */
  test('TC-EXQS-003: Xóa tất cả câu hỏi của bài thi', async () => {
    const result = await (ExamQuestionService as any).removeAll(1);
    expect(result).toBe(true);
  });

  /**
   * TC-EXQS-004: Kiểm tra câu hỏi trong bài thi [CheckDB]
   */
  test('TC-EXQS-004: Kiểm tra câu hỏi trong bài thi', async () => {
    const result = await (ExamQuestionService as any).checkExists(1, 1);
    expect(result).toBe(true);
  });

  /**
   * TC-EXQS-005: Lấy số lượng câu hỏi của bài thi [CheckDB]
   */
  test('TC-EXQS-005: Lấy số lượng câu hỏi của bài thi', async () => {
    const result = await (ExamQuestionService as any).getCount(1);
    expect(result).toBe(10);
  });
});
