const fs = require('fs');
const content = 'Hạng mục,Nội dung chi tiết\n' +
'\"1. GIẢI THÍCH CHỈ SỐ\",\"\"\n' +
'\"Statements %\",\"Tỷ lệ phần trăm các câu lệnh thực thi trong mã nguồn đã được chạy qua.\"\n' +
'\"Branches %\",\"Tỷ lệ các nhánh quyết định (if/else/switch) được thực hiện. Quan trọng nhất để kiểm tra logic.\"\n' +
'\"Functions %\",\"Tỷ lệ các hàm/phương thức đã được gọi ít nhất một lần.\"\n' +
'\"Lines %\",\"Tỷ lệ các dòng code thực tế trong file đã được chạy.\"\n' +
'\"\",\"\"\n' +
'\"2. ĐÁNH GIÁ KẾT QUẢ\",\"\"\n' +
'\"Điểm mạnh\",\"Các Service trọng yếu (Auth, User, Goal) có độ phủ cực cao (>95%). Đảm bảo an toàn cho các chức năng sống còn.\"\n' +
'\"Điểm yếu\",\"Tỷ lệ tổng thể đạt ~30% do codebase dự án quá lớn và nhiều hàm phụ trợ chưa được ưu tiên test.\"\n' +
'\"Lý do tỷ lệ 30%\",\"Phạm vi audit tập trung vào logic nghiệp vụ và bảo mật thay vì bao phủ 100% mã nguồn.\"\n' +
'\"\",\"\"\n' +
'\"3. KẾT LUẬN & KIẾN NGHỊ\",\"\"\n' +
'\"Kết luận\",\"Đạt yêu cầu cho mục đích Kiểm thử Audit (Functional & Security Audit).\"\n' +
'\"Kiến nghị 1\",\"Cần viết thêm test cho các hàm tính toán thống kê trong Dashboard và Bank.\"\n' +
'\"Kiến nghị 2\",\"Refactor các service quá lớn để dễ dàng quản lý và kiểm thử.\"';

fs.writeFileSync('Coverage_Evaluation_Report.csv', '\ufeff' + content);
console.log('Coverage_Evaluation_Report.csv created.');
