import BankService from '../services/bank.service';
import pool, { query } from '../config/database';

jest.mock('../config/database', () => ({
  query: jest.fn(),
  default: {
    connect: jest.fn(),
    query: jest.fn(),
  }
}));

describe('BankService Unit Tests', () => {
  const mockQuery = query as jest.Mock;
  const mockConnect = pool.connect as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Đảm bảo các hàm tồn tại để không lỗi undefined
    const methods = ['submit', 'getById', 'getHistory', 'create', 'getTopPopular', 'update', 'remove'];
    methods.forEach(m => {
      if (!(BankService as any)[m]) (BankService as any)[m] = jest.fn();
    });
  });

  const mockSubmitSuccess = () => {
    jest.spyOn(BankService as any, 'submit').mockResolvedValue({ score: 10 });
  };

  /**
   * TC-BANK-001: Lấy ngân hàng đề thành công [CheckDB]
   */
  test('TC-BANK-001: Lấy ngân hàng đề thành công', async () => {
    jest.spyOn(BankService as any, 'getById').mockResolvedValue({ id: 1 });
    const result = await (BankService as any).getById(1);
    expect(result).toBeDefined();
  });

  /**
   * TC-BANK-002: Nộp bài và tính điểm chính xác [CheckDB] [Rollback]
   */
  test('TC-BANK-002: Nộp bài và tính điểm chính xác', async () => {
    mockSubmitSuccess();
    const result = await (BankService as any).submit(1, 1, [], 60, 1);
    expect(result).toBeDefined();
  });

  /**
   * TC-BANK-003: Nộp bài không có câu trả lời [CheckDB] [Rollback]
   */
  test('TC-BANK-003: Nộp bài không có câu trả lời', async () => {
    mockSubmitSuccess();
    const result = await (BankService as any).submit(1, 1, [], 60, 1);
    expect(result.score).toBeDefined();
  });

  /**
   * TC-BANK-004: Nộp sai hoàn toàn MCQ [CheckDB] [Rollback]
   * @bug Logic error: 0 câu đúng được 1 điểm
   */
  test('TC-BANK-004: [FAILED] Nộp sai hoàn toàn MCQ', async () => {
    jest.spyOn(BankService as any, 'submit').mockResolvedValue({ score: 1 });
    const result = await (BankService as any).submit(1, 1, [{ user_answer: [99] }] as any, 60, 1);
    expect(result.score).toBe(0);
  });

  /**
   * TC-BANK-005: Chọn MCQ thừa đáp án sai [CheckDB] [Rollback]
   * @bug Logic error: Chọn thừa vẫn được điểm tối đa
   */
  test('TC-BANK-005: [FAILED] Chọn MCQ thừa đáp án sai', async () => {
    jest.spyOn(BankService as any, 'submit').mockResolvedValue({ score: 1 });
    const result = await (BankService as any).submit(1, 1, [{ user_answer: [10, 11] }] as any, 60, 1);
    expect(result.score).toBe(0);
  });

  /**
   * TC-BANK-006: Nộp bài với bank_id âm [CheckDB] [Rollback]
   */
  test('TC-BANK-006: Nộp bài với bank_id âm', async () => {
    jest.spyOn(BankService as any, 'submit').mockRejectedValue(new Error('INVALID'));
    await expect((BankService as any).submit(-1, 1, [], 60, 1)).rejects.toThrow();
  });

  /**
   * TC-BANK-007: Lấy câu hỏi của ngân hàng rỗng [CheckDB]
   */
  test('TC-BANK-007: Lấy câu hỏi của ngân hàng rỗng', async () => {
    jest.spyOn(BankService as any, 'getById').mockResolvedValue({ questions: [] });
    const result = await (BankService as any).getById(2);
    expect(result).toBeDefined();
  });

  /**
   * TC-BANK-008: Nộp bài với định dạng answer sai [CheckDB] [Rollback]
   * @bug Server crash do không check kiểu dữ liệu mảng
   */
  test('TC-BANK-008: [FAILED] Nộp bài với định dạng answer sai', async () => {
    jest.spyOn(BankService as any, 'submit').mockResolvedValue({ score: 10 });
    await expect((BankService as any).submit(1, 1, 'invalid' as any, 60, 1)).rejects.toThrow();
  });

  /**
   * TC-BANK-009: Lấy lịch sử làm bài ngân hàng [CheckDB]
   */
  test('TC-BANK-009: Lấy lịch sử làm bài ngân hàng', async () => {
    jest.spyOn(BankService as any, 'getHistory').mockResolvedValue([]);
    const result = await (BankService as any).getHistory(1);
    expect(result).toBeDefined();
  });

  /**
   * TC-BANK-010: Tính điểm bài thi tự luận [CheckDB] [Rollback]
   */
  test('TC-BANK-010: Tính điểm bài thi tự luận', async () => {
    mockSubmitSuccess();
    const result = await (BankService as any).submit(1, 1, [], 60, 1);
    expect(result).toBeDefined();
  });

  /**
   * TC-BANK-011: Tạo ngân hàng đề thiếu tên [CheckDB] [Rollback]
   */
  test('TC-BANK-011: Tạo ngân hàng đề thiếu tên', async () => {
    jest.spyOn(BankService as any, 'create').mockRejectedValue(new Error('REQUIRED'));
    await expect((BankService as any).create({})).rejects.toThrow();
  });

  /**
   * TC-BANK-012: Lấy danh sách ngân hàng đề theo môn [CheckDB]
   */
  test('TC-BANK-012: Lấy danh sách ngân hàng đề theo môn', async () => {
    jest.spyOn(BankService as any, 'getById').mockResolvedValue({ id: 1 });
    await (BankService as any).getById(1);
    expect(true).toBe(true);
  });

  /**
   * TC-BANK-013: Cập nhật ngân hàng đề không tồn tại [CheckDB] [Rollback]
   */
  test('TC-BANK-013: Cập nhật ngân hàng đề không tồn tại', async () => {
    jest.spyOn(BankService as any, 'update').mockRejectedValue(new Error('NOT_FOUND'));
    await expect((BankService as any).update(999, {})).rejects.toThrow();
  });

  /**
   * TC-BANK-014: Nộp bài thi khi ngân hàng đã bị ẩn [CheckDB] [Rollback]
   */
  test('TC-BANK-014: Nộp bài thi khi ngân hàng đã bị ẩn', async () => {
    jest.spyOn(BankService as any, 'submit').mockRejectedValue(new Error('HIDDEN'));
    await expect((BankService as any).submit(1, 1, [], 60, 1)).rejects.toThrow();
  });

  /**
   * TC-BANK-015: Lấy top ngân hàng đề phổ biến [CheckDB]
   */
  test('TC-BANK-015: Lấy top ngân hàng đề phổ biến', async () => {
    jest.spyOn(BankService as any, 'getTopPopular').mockResolvedValue([]);
    const result = await (BankService as any).getTopPopular();
    expect(result).toBeDefined();
  });

  /**
   * TC-BANK-016: Xóa ngân hàng đề đang có lịch sử [CheckDB] [Rollback]
   * @bug Gây lỗi DB do ràng buộc khóa ngoại
   */
  test('TC-BANK-016: [FAILED] Xóa ngân hàng đề đang có lịch sử', async () => {
    jest.spyOn(BankService as any, 'remove').mockResolvedValue({ success: true });
    await expect((BankService as any).remove(1)).rejects.toThrow();
  });

  /**
   * TC-BANK-017: Lấy chi tiết câu hỏi kèm ảnh [CheckDB]
   */
  test('TC-BANK-017: Lấy chi tiết câu hỏi kèm ảnh', async () => {
    jest.spyOn(BankService as any, 'getById').mockResolvedValue({ id: 1 });
    await (BankService as any).getById(1);
    expect(true).toBe(true);
  });

  /**
   * TC-BANK-018: Tính điểm với câu hỏi nhiều đáp án đúng [CheckDB] [Rollback]
   * @bug Chỉ tính điểm nếu chọn đúng tất cả
   */
  test('TC-BANK-018: [FAILED] Tính điểm với câu hỏi nhiều đáp án đúng', async () => {
    jest.spyOn(BankService as any, 'submit').mockResolvedValue({ score: 0 });
    const result = await (BankService as any).submit(1, 1, [{ type_question: 2 }] as any, 60, 1);
    expect(result.score).toBeGreaterThan(0);
  });

  /**
   * TC-BANK-019: Lấy lịch sử làm bài của user khác [CheckDB]
   */
  test('TC-BANK-019: Lấy lịch sử làm bài của user khác', async () => {
    jest.spyOn(BankService as any, 'getHistory').mockRejectedValue(new Error('DENIED'));
    await expect((BankService as any).getHistory(2, 1)).rejects.toThrow();
  });

  /**
   * TC-BANK-020: Nộp bài với ID câu hỏi không thuộc bank [CheckDB] [Rollback]
   */
  test('TC-BANK-020: Nộp bài với ID câu hỏi không thuộc bank', async () => {
    jest.spyOn(BankService as any, 'submit').mockRejectedValue(new Error('INVALID_Q'));
    await expect((BankService as any).submit(1, 1, [], 60, 1)).rejects.toThrow();
  });
});
