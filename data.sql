-- Init data: subjects + topics
-- Idempotent inserts (won't duplicate existing rows)
BEGIN;

-- Subjects
INSERT INTO subject (subject_name, subject_type, available) VALUES
-- Toán
('Toán', 1, true),

-- Các môn còn lại
('Ngữ văn', 2, true),
('Tiếng Anh', 2, true),
('Vật lý', 2, true),
('Hóa học', 2, true),
('Sinh học', 2, true),
('Lịch sử', 2, true),
('Địa lý', 2, true),
('Giáo dục kinh tế và pháp luật', 2, true),
('Tin học', 2, true),
('Công nghệ', 2, true);

-- Topics for Toán
INSERT INTO topic (title, description, subject_id)
SELECT 'Đại số', 'Các phương trình, bất đẳng thức, đa thức và tính chất đại số cơ bản.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Toán'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Đại số' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Hình học', 'Hình học phẳng và không gian: tam giác, tứ giác, đường tròn và mối quan hệ hình học.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Toán'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Hình học' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Giải tích', 'Đạo hàm, tích phân, giới hạn và các ứng dụng cơ bản.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Toán'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Giải tích' AND t.subject_id = s.subject_id
  );

-- Topics for Vật Lý
INSERT INTO topic (title, description, subject_id)
SELECT 'Cơ học', 'Chuyển động, lực và định luật Newton.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Vật Lý'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Cơ học' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Điện học', 'Dòng điện, điện áp, điện trở và mạch điện cơ bản.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Vật Lý'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Điện học' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Quang học', 'Ánh sáng, phản xạ, khúc xạ và thấu kính.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Vật Lý'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Quang học' AND t.subject_id = s.subject_id
  );

-- Topics for Hóa Học
INSERT INTO topic (title, description, subject_id)
SELECT 'Hữu cơ', 'Hợp chất cacbon và các phản ứng hữu cơ cơ bản.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Hóa Học'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Hữu cơ' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Vô cơ', 'Nguyên tố, hợp chất vô cơ và phản ứng liên quan.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Hóa Học'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Vô cơ' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Hóa phân tích & vật lý hóa', 'Cân bằng, phương pháp phân tích và khái niệm nhiệt động học.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Hóa Học'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Hóa phân tích & vật lý hóa' AND t.subject_id = s.subject_id
  );

-- Topics for Ngữ Văn
INSERT INTO topic (title, description, subject_id)
SELECT 'Văn học', 'Phân tích tác phẩm, tác giả và bối cảnh văn học.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Ngữ Văn'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Văn học' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Ngữ pháp & kỹ năng viết', 'Ngữ pháp tiếng Việt, chính tả và kỹ năng viết cơ bản.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Ngữ Văn'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Ngữ pháp & kỹ năng viết' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Phong cách văn bản', 'Thuyết minh, nghị luận, tự sự và cách triển khai ý.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Ngữ Văn'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Phong cách văn bản' AND t.subject_id = s.subject_id
  );

-- Topics for Tiếng Anh
INSERT INTO topic (title, description, subject_id)
SELECT 'Ngữ pháp', 'Cấu trúc câu, các thì và mệnh đề trong tiếng Anh.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Tiếng Anh'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Ngữ pháp' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Từ vựng', 'Học từ mới theo chủ đề, collocations và cách dùng.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Tiếng Anh'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Từ vựng' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Kỹ năng nghe/nói', 'Luyện nghe, phát âm, hội thoại và phản xạ giao tiếp.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Tiếng Anh'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Kỹ năng nghe/nói' AND t.subject_id = s.subject_id
  );

-- Topics for Sinh Học
INSERT INTO topic (title, description, subject_id)
SELECT 'Sinh học tế bào', 'Cấu trúc và chức năng tế bào, phân bào và sinh học phân tử.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Sinh Học'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Sinh học tế bào' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Di truyền học', 'Gen, ADN, di truyền và luật Mendel.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Sinh Học'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Di truyền học' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Sinh thái học', 'Hệ sinh thái, mối quan hệ sinh học và chu trình vật chất.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Sinh Học'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Sinh thái học' AND t.subject_id = s.subject_id
  );

-- Topics for Lịch Sử
INSERT INTO topic (title, description, subject_id)
SELECT 'Lịch sử Việt Nam', 'Các giai đoạn, sự kiện và nhân vật quan trọng của lịch sử Việt Nam.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Lịch Sử'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Lịch sử Việt Nam' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Lịch sử Thế giới', 'Sự hình thành các nền văn minh, chiến tranh và biến cố toàn cầu.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Lịch Sử'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Lịch sử Thế giới' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Cận đại & Hiện đại', 'Sự kiện từ thế kỷ XIX đến nay và ảnh hưởng của chúng.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Lịch Sử'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Cận đại & Hiện đại' AND t.subject_id = s.subject_id
  );

-- Topics for Địa Lý
INSERT INTO topic (title, description, subject_id)
SELECT 'Địa lý tự nhiên', 'Địa hình, khí hậu, thủy văn và các yếu tố tự nhiên.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Địa Lý'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Địa lý tự nhiên' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Địa lý kinh tế - dân cư', 'Phân bố dân cư, tài nguyên và hoạt động kinh tế.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Địa Lý'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Địa lý kinh tế - dân cư' AND t.subject_id = s.subject_id
  );

INSERT INTO topic (title, description, subject_id)
SELECT 'Bản đồ học & kỹ năng', 'Đọc bản đồ, tọa độ và kỹ năng biểu diễn không gian.', s.subject_id
FROM subject s
WHERE s.subject_name = 'Địa Lý'
  AND NOT EXISTS (
    SELECT 1 FROM topic t WHERE t.title = 'Bản đồ học & kỹ năng' AND t.subject_id = s.subject_id
  );

COMMIT;

INSERT INTO flashcard_deck (title, description, user_id)
VALUES
('Toán THPT Quốc gia', 'Công thức – định lý Toán trọng tâm', 1),
('Ngữ văn THPT Quốc gia', 'Tác phẩm – nghị luận – tiếng Việt', 1),
('Tiếng Anh THPT Quốc gia', 'Ngữ pháp – từ vựng – cấu trúc câu', 1),
('Vật lí THPT Quốc gia', 'Công thức và hiện tượng vật lí', 1),
('Hóa học THPT Quốc gia', 'Phản ứng – khái niệm hóa học', 1),
('Sinh học THPT Quốc gia', 'Di truyền – sinh thái – tiến hóa', 1),
('Lịch sử THPT Quốc gia', 'Sự kiện – mốc thời gian', 1),
('Địa lí THPT Quốc gia', 'Tự nhiên – kinh tế – kỹ năng Atlat', 1),
('GD Kinh tế & Pháp luật', 'Khái niệm kinh tế – pháp luật cơ bản', 1),
('Tin học THPT Quốc gia', 'Thuật toán – dữ liệu – CNTT', 1),
('Công nghệ THPT Quốc gia', 'Kĩ thuật – sản xuất – ứng dụng', 1);

INSERT INTO flashcard (front, back, example, flashcard_deck_id) VALUES
('Công thức nghiệm PT bậc hai?', 'x = (-b ± √(b² - 4ac)) / 2a', 'x²-3x+2=0', 1),
('Δ của PT bậc hai?', 'Δ = b² - 4ac', '', 1),
('Đạo hàm của sin(x)?', 'cos(x)', '', 1),
('Đạo hàm của cos(x)?', '-sin(x)', '', 1),
('Nguyên hàm của 1/x?', 'ln|x| + C', '', 1),
('Thể tích hình chóp?', 'V = 1/3·S·h', '', 1),
('Thể tích hình cầu?', 'V = 4/3·π·R³', '', 1),
('Số phức z = a + bi, phần ảo?', 'b', '', 1),
('Cấp số cộng là?', 'Un+1 = Un + d', '', 1),
('Xác suất cổ điển?', 'P = số TH thuận lợi / số TH', '', 1);

INSERT INTO flashcard (front, back, example, flashcard_deck_id) VALUES
('Phong cách ngôn ngữ nghị luận?', 'Lí lẽ – lập luận – dẫn chứng', '', 2),
('Phong cách ngôn ngữ khoa học?', 'Chính xác – logic – khái quát', '', 2),
('Các thao tác lập luận?', 'Giải thích, phân tích, chứng minh, bình luận', '', 2),
('Tác giả Vợ Nhặt?', 'Kim Lân', '', 2),
('Tác giả Tây Tiến?', 'Quang Dũng', '', 2),
('Hoàn cảnh ra đời Việt Bắc?', 'Sau chiến thắng Điện Biên Phủ', '', 2),
('Biện pháp tu từ so sánh?', 'Đối chiếu sự vật có nét tương đồng', '', 2),
('Biện pháp ẩn dụ?', 'Gọi tên bằng sự vật tương đồng', '', 2),
('Nghị luận xã hội là gì?', 'Bàn về vấn đề đời sống', '', 2),
('Nghị luận văn học là gì?', 'Phân tích tác phẩm văn học', '', 2);
INSERT INTO flashcard (front, back, example, flashcard_deck_id) VALUES
('Câu bị động HTĐ?', 'S + am/is/are + V3', '', 3),
('Câu điều kiện loại 1?', 'If + HTĐ, will + V', '', 3),
('Câu điều kiện loại 2?', 'If + QKĐ, would + V', '', 3),
('So sánh hơn?', 'adj-er / more + adj', '', 3),
('So sánh nhất?', 'the adj-est / most + adj', '', 3),
('Mệnh đề quan hệ?', 'who, which, that', '', 3),
('Thì hiện tại hoàn thành?', 'have/has + V3', '', 3),
('Gerund là?', 'V-ing', '', 3),
('Infinitive là?', 'to V', '', 3),
('Câu gián tiếp?', 'Reported speech', '', 3);

INSERT INTO flashcard (front, back, example, flashcard_deck_id) VALUES
('Định luật Ôm?', 'I = U / R', '', 4),
('Công suất điện?', 'P = UI', '', 4),
('Động năng?', 'Wđ = 1/2mv²', '', 4),
('Thế năng trọng trường?', 'Wt = mgh', '', 4),
('Chu kì con lắc đơn?', 'T = 2π√(l/g)', '', 4),
('Gia tốc rơi tự do?', 'g ≈ 9,8 m/s²', '', 4),
('Tốc độ ánh sáng?', 'c = 3×10⁸ m/s', '', 4),
('Hiện tượng quang điện?', 'Electron bật khỏi kim loại', '', 4),
('Dòng điện xoay chiều?', 'I = I0cos(ωt)', '', 4),
('Bước sóng?', 'λ = v/f', '', 4);
INSERT INTO flashcard (front, back, example, flashcard_deck_id) VALUES
('pH là gì?', 'pH = -log[H+]', '', 5),
('Kim loại kiềm?', 'Nhóm IA', '', 5),
('Este là?', 'Sản phẩm axit + ancol', '', 5),
('Phản ứng oxi hóa – khử?', 'Có trao đổi electron', '', 5),
('Ancol no đơn chức?', 'CnH2n+1OH', '', 5),
('Axit cacboxylic?', 'R-COOH', '', 5),
('Bazơ là?', 'Chất phân li ra OH-', '', 5),
('Muối là?', 'Sản phẩm axit + bazơ', '', 5),
('Chất điện li mạnh?', 'Phân li hoàn toàn', '', 5),
('Bảo toàn khối lượng?', 'm trước = m sau', '', 5);
INSERT INTO flashcard (front, back, example, flashcard_deck_id) VALUES
('ADN gồm mấy loại nu?', '4 loại: A,T,G,X', '', 6),
('ARN có T không?', 'Không, thay bằng U', '', 6),
('Quy luật phân li?', 'Mỗi tính trạng do 1 cặp alen', '', 6),
('Quy luật phân li độc lập?', 'Các cặp gen phân li độc lập', '', 6),
('Quang hợp diễn ra ở?', 'Lục lạp', '', 6),
('Hô hấp tế bào?', 'Ti thể', '', 6),
('NST là gì?', 'Nhiễm sắc thể', '', 6),
('Đột biến gen?', 'Thay đổi cấu trúc gen', '', 6),
('Tiến hóa là?', 'Biến đổi di truyền qua thế hệ', '', 6),
('Sinh thái học?', 'Quan hệ sinh vật – môi trường', '', 6);
INSERT INTO flashcard (front, back, example, flashcard_deck_id) VALUES
('Đảng CSVN thành lập?', '1930', '', 7),
('CMT8 thành công?', '1945', '', 7),
('Điện Biên Phủ?', '1954', '', 7),
('Hiệp định Giơ-ne-vơ?', '1954', '', 7),
('Chiến dịch Hồ Chí Minh?', '1975', '', 7),
('Kháng chiến chống Pháp?', '1946–1954', '', 7),
('Kháng chiến chống Mỹ?', '1954–1975', '', 7),
('Đổi mới đất nước?', '1986', '', 7),
('ASEAN VN gia nhập?', '1995', '', 7),
('CT Hồ Chí Minh mất?', '1969', '', 7);
INSERT INTO flashcard (front, back, example, flashcard_deck_id) VALUES
('Khí hậu Việt Nam?', 'Nhiệt đới gió mùa', '', 8),
('Vùng kinh tế trọng điểm?', 'Bắc – Trung – Nam', '', 8),
('Atlat dùng để?', 'Khai thác số liệu địa lí', '', 8),
('Đồng bằng lớn nhất?', 'ĐBSCL', '', 8),
('Nguồn điện chủ yếu?', 'Thủy điện, nhiệt điện', '', 8),
('Dân số VN đông thứ?', 'Top 15 thế giới', '', 8),
('Biển Đông thuộc?', 'Thái Bình Dương', '', 8),
('Khoáng sản chính?', 'Than, dầu khí', '', 8),
('Cơ cấu kinh tế?', 'NN – CN – DV', '', 8),
('Đô thị hóa là?', 'Gia tăng dân số đô thị', '', 8);
INSERT INTO flashcard (front, back, example, flashcard_deck_id) VALUES
('Pháp luật là gì?', 'Quy tắc xử sự chung', '', 9),
('Nhà nước là?', 'Tổ chức quyền lực đặc biệt', '', 9),
('Cung là?', 'Khả năng bán hàng hóa', '', 9),
('Cầu là?', 'Nhu cầu mua hàng hóa', '', 9),
('Quyền bình đẳng?', 'Không phân biệt đối xử', '', 9),
('Công dân là?', 'Người có quốc tịch', '', 9),
('Kinh tế thị trường?', 'Theo cung – cầu', '', 9),
('Thuế là?', 'Khoản nộp bắt buộc', '', 9),
('Vi phạm pháp luật?', 'Hành vi trái pháp luật', '', 9),
('Trách nhiệm pháp lí?', 'Hậu quả pháp lí', '', 9);
INSERT INTO flashcard (front, back, example, flashcard_deck_id) VALUES
('Thuật toán là?', 'Chuỗi bước giải quyết bài toán', '', 10),
('Ngôn ngữ lập trình?', 'Python, C++, Java...', '', 10),
('Biến là?', 'Vùng nhớ lưu dữ liệu', '', 10),
('Kiểu Boolean?', 'True / False', '', 10),
('Vòng lặp for?', 'Lặp số lần xác định', '', 10),
('Vòng lặp while?', 'Lặp khi điều kiện đúng', '', 10),
('Mảng là?', 'Tập hợp phần tử cùng kiểu', '', 10),
('Hệ điều hành?', 'Windows, Linux', '', 10),
('Internet là?', 'Mạng toàn cầu', '', 10),
('An toàn thông tin?', 'Bảo mật dữ liệu', '', 10);


-- INSERT INTO exam (
--   exam_name,
--   time_limit,
--   topic_id,
--   exam_schedule_id,
--   description,
--   available
-- )
-- SELECT
--   'THPT Quốc gia ' || t.title || ' 2025 - Đề số ' || g.n,
--   90,
--   t.topic_id,
--   1, -- tạm, sẽ random ở phần sau
--   'Đề thi thử THPT Quốc gia môn ' || t.title || ' năm 2025',
--   true
-- FROM topic t
-- CROSS JOIN generate_series(1, 3) AS g(n);



-- INSERT INTO exam (
--   exam_name,
--   time_limit,
--   topic_id,
--   exam_schedule_id,
--   description,
--   available
-- )
-- SELECT
--   'THPT Quốc gia ' || t.title || ' 2025 Lớp 12 Lần 1',
--   90,
--   t.topic_id,
--   s.exam_schedule_id,
--   'Đề luyện thi lớp 10 môn ' || t.title,
--   true
-- FROM topic t
-- CROSS JOIN LATERAL (
--   SELECT exam_schedule_id
--   FROM exam_schedule
--   ORDER BY random()
--   LIMIT 1
-- ) s;




-- INSERT INTO exam (
--   exam_name,
--   time_limit,
--   topic_id,
--   exam_schedule_id,
--   description,
--   available
-- )
-- SELECT
--   'THPT Quốc gia ' || t.title || ' 2025 Lớp 12 Lần 1',
--   90,
--   t.topic_id,
--   s.exam_schedule_id,
--   'Đề luyện thi lớp 11 môn ' || t.title,
--   true
-- FROM topic t
-- CROSS JOIN LATERAL (
--   SELECT exam_schedule_id
--   FROM exam_schedule
--   ORDER BY random()
--   LIMIT 1
-- ) s;



-- INSERT INTO exam (
--   exam_name,
--   time_limit,
--   topic_id,
--   exam_schedule_id,
--   description,
--   available
-- )
-- SELECT
--   'THPT Quốc gia ' || t.title || ' 2025 Lớp 12 Lần 1',
--   90,
--   t.topic_id,
--   s.exam_schedule_id,
--   'Đề luyện thi lớp 12 môn ' || t.title,
--   true
-- FROM topic t
-- CROSS JOIN LATERAL (
--   SELECT exam_schedule_id
--   FROM exam_schedule
--   ORDER BY random()
--   LIMIT 1
-- ) s;



-- INSERT INTO history_exam (
--   exam_id,
--   user_id,
--   score,
--   time_test,
--   created_at
-- )
-- SELECT
--   e.exam_id,
--   u.user_id,

--   round(
--     LEAST(10, GREATEST(0, random() * 4 + 4))::numeric,
--     2
--   ),

--   CASE
--     WHEN random() < 0.2 THEN floor(random() * 600 + 300)
--     WHEN random() < 0.8 THEN floor(random() * 1800 + 1800)
--     ELSE floor(random() * 600 + 3000)
--   END,

--   now()
--     - (floor(random() * 180) || ' days')::interval
--     - (floor(random() * 24) || ' hours')::interval
--     - (floor(random() * 60) || ' minutes')::interval
-- FROM generate_series(1, 2000)
-- CROSS JOIN LATERAL (
--   SELECT exam_id FROM exam ORDER BY random() LIMIT 1
-- ) e
-- CROSS JOIN LATERAL (
--   SELECT user_id FROM "user" ORDER BY random() LIMIT 1
-- ) u;



-- INSERT INTO "user" (
--   user_name,
--   email,
--   password_hash,
--   role_id
-- )
-- SELECT
--   -- Tên tiếng Việt random
--   (ARRAY[
--     'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang',
--     'Vu', 'Do', 'Bui', 'Dang', 'Phan'
--   ])[ceil(random() * 10)] || ' ' ||
--   (ARRAY[
--     'Van', 'Thi', 'Minh', 'Quoc', 'Anh',
--     'Ngoc', 'Thanh', 'Duc', 'Gia', 'Khanh'
--   ])[ceil(random() * 10)] || ' ' ||
--   (ARRAY[
--     'An', 'Binh', 'Chau', 'Dung', 'Hieu',
--     'Khang', 'Linh', 'Nam', 'Phuong', 'Trang'
--   ])[ceil(random() * 10)],

--   -- Email unique 100%
--   'user_' || gs || '@demo.edu.vn',

--   -- password: 123456
--   '$2b$10$XFOARZELuSTsaJnQI7Irk.VwfBQU/fb3ponw0vHlnSrpLpXHncyJa',

--   -- 90% học sinh, 8% giáo viên, 2% admin
--   CASE
--     WHEN random() < 0.90 THEN 1
--     WHEN random() < 0.98 THEN 2
--     ELSE 1
--   END
-- FROM generate_series(1, 100000) gs;



INSERT INTO "user" (
  user_name,
  email,
  password_hash,
  role_id,
  created_at
)
SELECT
  -- Tên tiếng Việt random
  (ARRAY[
    'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang',
    'Vu', 'Do', 'Bui', 'Dang', 'Phan'
  ])[ceil(random() * 10)] || ' ' ||
  (ARRAY[
    'Van', 'Thi', 'Minh', 'Quoc', 'Anh',
    'Ngoc', 'Thanh', 'Duc', 'Gia', 'Khanh'
  ])[ceil(random() * 10)] || ' ' ||
  (ARRAY[
    'An', 'Binh', 'Chau', 'Dung', 'Hieu',
    'Khang', 'Linh', 'Nam', 'Phuong', 'Trang'
  ])[ceil(random() * 10)],

  -- email unique
  'user_' || gs || '@demo.edu.vn',

  -- password: 123456
  '$2b$10$XFOARZELuSTsaJnQI7Irk.VwfBQU/fb3ponw0vHlnSrpLpXHncyJa',

  -- role
  CASE
    WHEN random() < 0.90 THEN 1
    WHEN random() < 0.98 THEN 2
    ELSE 1
  END,

  -- 🔥 created_at: random từ 01/11/2025 → now
  TIMESTAMPTZ '2025-11-01'
    + random() * (now() - TIMESTAMPTZ '2025-11-01')

FROM generate_series(1, 100000) gs;





INSERT INTO exam_schedule (
  start_time,
  end_time,
  created_at,
  updated_at
)
SELECT
  start_time,
  start_time + (window_days || ' days')::interval AS end_time,
  now(),
  now()
FROM (
  SELECT
    -- mỗi lịch có start_time khác nhau (nhờ seq)
    date_trunc('day', now() - interval '30 days')
      + (seq * interval '3 hours')   -- mỗi lịch lệch nhau 3h
      + CASE slot
          WHEN 1 THEN interval '08:00'
          WHEN 2 THEN interval '13:30'
          ELSE interval '18:00'
        END AS start_time,

    floor(random() * 3) + 1 AS window_days
  FROM generate_series(0, 19) seq
  CROSS JOIN generate_series(1, 3) slot
) s;






INSERT INTO exam (
  exam_name,
  time_limit,
  topic_id,
  exam_schedule_id,
  description,
  available
)
SELECT
  'THPT Quốc gia ' || t.title || ' 2025 - Đề số ' || g.n || ' - Ca ' || s.k,
  90,
  t.topic_id,
  es.exam_schedule_id,
  'Đề thi thử THPT Quốc gia môn ' || t.title || ' năm 2025',
  true
FROM exam_schedule es

-- mỗi schedule chọn ngẫu nhiên 3–7 exam
JOIN LATERAL (
  SELECT
    t.topic_id,
    t.title,
    g.n,
    s.k
  FROM topic t
  CROSS JOIN generate_series(1, 3) AS g(n)   -- 3 đề / topic
  CROSS JOIN generate_series(1, 3) AS s(k)   -- 3 ca / đề
  ORDER BY random()
  LIMIT floor(random() * 5) + 3   -- 3 → 7
) x ON true

JOIN topic t ON t.topic_id = x.topic_id
JOIN generate_series(x.n, x.n) g(n) ON true
JOIN generate_series(x.k, x.k) s(k) ON true

-- đảm bảo schedule đủ dài
WHERE EXTRACT(EPOCH FROM (es.end_time - es.start_time)) >= 90 * 60;

INSERT INTO bank (
  description,
  topic_id,
  time_limit,
  available
)
SELECT
  'Ngân hàng câu hỏi luyện thi THPT Quốc gia môn ' || t.title || ' năm 2025 - Bộ ' || g.n,
  t.topic_id,
  90,
  true
FROM topic t
JOIN LATERAL (
  SELECT n
  FROM generate_series(1, 10) g(n)          -- pool
  ORDER BY random()
  LIMIT floor(random() * 5) + 3             -- 3 → 7 bank / topic
) g ON true;


INSERT INTO history_exam (
  exam_id,
  user_id,
  score,
  time_test,
  created_at
)
SELECT
  e.exam_id,
  u.user_id,

  round(
    LEAST(10, GREATEST(0, random() * 4 + 4))::numeric,
    2
  ) AS score,

  tt.time_test,

  es.start_time
    + random()
      * (
        (es.end_time - es.start_time)
        - (tt.time_test || ' seconds')::interval
      ) AS created_at

FROM exam e
JOIN exam_schedule es
  ON es.exam_schedule_id = e.exam_schedule_id

-- 🔑 số user PHỤ THUỘC exam_id (70–200)
JOIN LATERAL (
  SELECT
    170 + (abs(hashtext(e.exam_id::text)) % 31) AS user_count
) uc ON true

JOIN LATERAL (
  SELECT user_id
  FROM "user"
  ORDER BY random()
  LIMIT uc.user_count
) u ON true

JOIN LATERAL (
  SELECT
    LEAST(
      floor(random() * e.time_limit * 60),
      EXTRACT(EPOCH FROM (es.end_time - es.start_time))
    )::bigint AS time_test
) tt ON true

WHERE
  e.available = true
  AND es.end_time > es.start_time;