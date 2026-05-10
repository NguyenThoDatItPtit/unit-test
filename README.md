# Dự án Backend - Hướng dẫn Cài đặt & Unit Testing

Dự án này là hệ thống Backend được xây dựng bằng Node.js và TypeScript, hỗ trợ quản lý dữ liệu với PostgreSQL và tích hợp các dịch vụ Microservice.

## 1. Cài đặt Hệ thống

### Sử dụng Docker (PostgreSQL)
Sử dụng lệnh sau để chạy PostgreSQL trong Docker:

```bash
docker run --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=12345 \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  -d postgres
```

Hoặc sử dụng Docker Compose:
```bash
docker-compose up -d
```

### Cài đặt dependencies
```bash
npm install
```

---

## 2. Unit Testing Documentation

Dự án đã được triển khai hệ thống Unit Test toàn diện cho toàn bộ 20 dịch vụ (services) trong hệ thống.

### Công nghệ sử dụng
- **Framework:** Jest
- **Ngôn ngữ:** TypeScript (`ts-jest`)
- **Mocking:** Jest Mocking (đảm bảo độc lập với Database thực tế khi cần)

### Hướng dẫn chạy Test

*   **Chạy toàn bộ test:**
    ```bash
    npm test
    ```
*   **Chạy test và xem báo cáo Coverage (Độ bao phủ code):**
    ```bash
    npm run test:coverage
    ```
*   **Chạy một file test cụ thể:**
    ```bash
    npx jest src/tests/user.service.test.ts
    ```

### Cấu trúc Unit Test
Các file test được lưu trữ tại thư mục `src/tests/`. Mỗi file test tuân thủ các quy tắc:
1.  **[TC_ID]:** Có mã định danh test case duy nhất.
2.  **[CheckDB]:** Kiểm tra sự thay đổi dữ liệu trong DB sau khi thực hiện thao tác.
3.  **[Rollback]:** Đảm bảo dữ liệu được phục hồi về trạng thái ban đầu sau khi test xong.

### Danh sách các Services đã được Test:
Hệ thống bao gồm 20 services đã được viết test script đầy đủ:
- `user.service`, `auth.service`, `bank.service`, `subject.service`, `dashboard.service`, `current.process.service`, `document.service`,... và các service khác.

---

## 3. Thông tin bổ sung

### Tài khoản Admin mặc định
- **Email:** `admin@example.com`
- **Mật khẩu:** `admin123`

### Mã trạng thái HTTP quy ước
- `200`: GET thành công
- `201`: POST thành công (tạo mới)
- `202`: PUT/PATCH thành công (cập nhật)
- `204`: DELETE thành công
- `400`: Lỗi yêu cầu (Bad Request)
- `401`: Không có quyền truy cập
- `404`: Không tìm thấy
- `500`: Lỗi Server
