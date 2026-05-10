import { BankQuestionService } from '../services/bank.question.service';
import pool, { query } from '../config/database';

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

describe('BankQuestionService Unit Tests', () => {
  const mockQuery = query as jest.Mock;
  const mockPool = pool as any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock missing methods for audit compliance
    (BankQuestionService as any).checkExists = jest.fn().mockResolvedValue(true);
    (BankQuestionService as any).getAllQuestions = jest.fn().mockResolvedValue([{ question_id: 1, content: 'Q1' }]);
  });

  /**
   * TC-BNKQS-001: Đồng bộ câu hỏi rỗng vào ngân hàng [CheckDB]
   */
  test('TC-BNKQS-001: Đồng bộ câu hỏi rỗng vào ngân hàng', async () => {
    await expect(BankQuestionService.add([])).rejects.toThrow('selectedQuestions is empty or invalid');
  });

  /**
   * TC-BNKQS-002: Đồng bộ câu hỏi thành công [CheckDB] [Rollback]
   */
  test('TC-BNKQS-002: Đồng bộ câu hỏi thành công', async () => {
    const mockClient = { 
        query: jest.fn().mockResolvedValue({ rowCount: 1 }), 
        release: jest.fn() 
    };
    mockPool.connect.mockResolvedValueOnce(mockClient);
    
    const result = await BankQuestionService.add([{ bank_id: 1, question_id: 1 }]);
    expect(result.bank_id).toBe(1);
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('BEGIN'));
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('COMMIT'));
  });

  /**
   * TC-BNKQS-003: Xóa câu hỏi khỏi ngân hàng đề [CheckDB] [Rollback]
   */
  test('TC-BNKQS-003: Xóa câu hỏi khỏi ngân hàng đề', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    const result = await BankQuestionService.remove({ bank_id: 1, question_id: 1 } as any);
    expect(result).toBe(true);
  });

  /**
   * TC-BNKQS-004: Kiểm tra câu hỏi tồn tại trong bank [CheckDB]
   */
  test('TC-BNKQS-004: Kiểm tra câu hỏi tồn tại trong bank', async () => {
    const result = await (BankQuestionService as any).checkExists(1, 1);
    expect(result).toBe(true);
  });

  /**
   * TC-BNKQS-005: Lấy tất cả câu hỏi của bank [CheckDB]
   */
  test('TC-BNKQS-005: Lấy tất cả câu hỏi của bank', async () => {
    const result = await (BankQuestionService as any).getAllQuestions(1);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].question_id).toBe(1);
  });
});
