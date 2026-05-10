import DocumentService from '../services/document.service';
import { query } from '../config/database';

jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

describe('DocumentService Unit Tests', () => {
  const mockQuery = query as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TC-DOC-001: Lấy tất cả tài liệu thành công với bộ lọc [CheckDB]
   */
  test('TC-DOC-001: Lấy tất cả tài liệu thành công với bộ lọc', async () => {
    // Lần gọi 1: SELECT documents
    mockQuery.mockResolvedValueOnce({ rows: [{ document_id: 1 }] });
    // Lần gọi 2: SELECT COUNT(*) AS total
    mockQuery.mockResolvedValueOnce({ rows: [{ total: 1 }] });

    const result = await (DocumentService as any).getAll(1, 'All', '', 0, 1);
    expect(result.documents.length).toBeGreaterThan(0);
    expect(result.totalPages).toBe(1);
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  /**
   * TC-DOC-002: Tạo tài liệu mới thành công [CheckDB] [Rollback]
   */
  test('TC-DOC-002: Tạo tài liệu mới thành công', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ document_id: 1 }] });
    await (DocumentService as any).create({ title: 'New Doc', topic_id: 1 } as any, 'http://link.com');
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT'), expect.any(Array));
  });

  /**
   * TC-DOC-003: Cập nhật tài liệu thành công [CheckDB] [Rollback]
   */
  test('TC-DOC-003: Cập nhật tài liệu thành công', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ document_id: 1, title: 'Updated Title' }] });
    await (DocumentService as any).update(1, { title: 'Updated Title' });
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE'), expect.any(Array));
  });

  /**
   * TC-DOC-004: Xóa tài liệu thành công [CheckDB] [Rollback]
   */
  test('TC-DOC-004: Xóa tài liệu thành công', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    await (DocumentService as any).remove(1);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('DELETE'), expect.any(Array));
  });
});
