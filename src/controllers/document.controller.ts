import DocumentService from "../services/document.service";
import safeExecute, { DefaultResponse } from "../utils/safe.execute";
import { Request, Response } from "express";
import path from "path";

const DocumentController = {
  async getAll(req: Request, res: Response) {
    const result: DefaultResponse<any> = await safeExecute(async () => {
      const page = Number(req.query.page) || 1;
      const status = req.query.available?.toString() || "All";
      const searchValue = req.query.keyword?.toString() || "";
      const topicIds = req.query.topic_ids
        ? Number(req.query.topic_ids)
        : "All";

      const subject_id = req.query.subject_id
        ? Number(req.query.subject_id)
        : "All"
        
      return {
        status: 200,
        message: "Lấy danh sách tài liệu thành công",
        data: await DocumentService.getAll(page, status, searchValue, topicIds, subject_id),
      };
    });

    return res.status(result.status).json(result);
  },

  async create(req: Request, res: Response) {
    const result: DefaultResponse<any> = await safeExecute(async () => {
      if (!req.file) throw new Error("Không có file được tải lên");

      // const file = req.file
      // const filePath = req.file.path;
      const ext = path.extname(req.file.filename).toLowerCase();
      const resourceDir = ext === ".pdf" ? "pdf_file" : "docx_file";
      const fileLink = `resources/${resourceDir}/${req.file.filename}`;
      const document = await DocumentService.create(req.body, fileLink);

      return {
        status: 200,
        message: "Tải tài liệu thành công",
        data: document,
      };
    });

    return res.status(result.status).json(result);
  },

  async update(req: Request, res: Response) {
    const result: DefaultResponse<any> = await safeExecute(async () => {
      return {
        status: 202,
        message: "Cập nhật tài liệu thành công",
        data: await DocumentService.update(Number(req.params.id), req.body),
      };
    });

    return res.status(result.status).json(result);
  },

  async setAvailable(req: Request, res: Response) {

    const result: DefaultResponse<any> = await safeExecute(async () => {
      return {
        status: 202,
        message: "Đổi trạng thái tài liệu thành công",
        data: await DocumentService.setAvailable(
          Number(req.params.id),
          Boolean(req.body.available)
        ),
      };
    });

    return res.status(result.status).json(result);
  },

  async remove(req: Request, res: Response) {
    const result: DefaultResponse<any> = await safeExecute(async () => {
      return {
        status: 204,
        message: "Xoá tài liệu thành công",
        data: await DocumentService.remove(Number(req.params.id)),
      };
    });

    return res.status(result.status).json(result);
  },
};

export default DocumentController;
