import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { Question } from "../models/question.model";
import { Answer } from "../models/answer.model";

export async function parseQuestionsFromCSV(filePath: string): Promise<Question[]> {
  const questions: Question[] = [];

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error("❌ File CSV không tồn tại"));
    }

    fs.createReadStream(path.resolve(filePath))
      .pipe(csv({ headers: ["question", "answer"], skipLines: 1 }))
      .on("data", (row) => {
        try {
          const rawQuestion = (row.question || "").trim();
          const rawAnswer = (row.answer || "").trim();
          const source = (row.source || "").trim();

          // Bỏ qua dòng không có nội dung
          if (!rawQuestion || !rawAnswer) return;

          // Chuẩn hóa question
          const question_content = rawQuestion;
          const question_name = rawQuestion.slice(0, 30); // tạm thời cắt ngắn làm tiêu đề
          const available = true;

          let answers: Answer[] = [];

          try {
            // Chuẩn hóa chuỗi answer để dễ parse
            let formatted = rawAnswer
              .replace(/""/g, '"') // thay "" bằng "
              .replace(/'\s*,/g, '",') // thêm dấu " nếu thiếu
              .replace(/,\s*'/g, ',"') // thêm dấu " nếu thiếu
              .replace(/'/g, '"') // đổi toàn bộ ' sang "
              .replace(/"{2,}/g, '"') // loại bỏ "" thừa
              .trim();

            // Đảm bảo bao quanh bằng []
            if (!formatted.startsWith("[")) formatted = "[" + formatted;
            if (!formatted.endsWith("]")) formatted = formatted + "]";

            // Parse an toàn
            let arr: any[] = [];
            try {
              arr = JSON.parse(formatted);
            } catch {
              // fallback — parse "thủ công" nếu lỗi JSON
              arr = formatted
                .replace(/^\[|\]$/g, "")
                .split(/","|','|\t|\\t| {2,}/)
                .map((a : any) => a.replace(/^"|"$/g, "").trim())
                .filter((a : any) => a.length > 0);
            }

            // Chuẩn hóa danh sách đáp án
            if (Array.isArray(arr)) {
              const uniqueAnswers = Array.from(new Set(arr)) // loại trùng
                .map((ans) => ans.trim())
                .filter((ans) => ans.length > 0);

              answers = uniqueAnswers.map(
                (ans): Answer => ({
                  answer_id: 0,
                  question_id: 0,
                  answer_content: ans,
                  is_correct: false,
                })
              );
            }
          } catch (err) {
            console.error("⚠️ Lỗi parse answer:", rawAnswer, err);
          }

          // Push vào danh sách nếu có ít nhất 1 đáp án
        //   if (answers.length > 0) {
        //     questions.push({
        //       question_id: 0,
        //       question_name,
        //       question_content,
        //       available,
        //       answers,
        //       source
        //     });
        //   }
        } catch (err) {
          console.error("⚠️ Lỗi xử lý dòng CSV:", row, err);
        }
      })
      .on("end", () => {
        console.log(`✅ Đã parse ${questions.length} câu hỏi hợp lệ`);
        resolve(questions);
      })
      .on("error", (err) => {
        console.error("❌ Lỗi đọc CSV:", err);
        reject(err);
      });
  });
}
