import { Request, Response } from 'express';
import TopicService from '../services/topic.service';
import safeExecute, { DefaultResponse } from '../utils/safe.execute';

const TopicController = {
    // Lấy toàn bộ topic
    async getAll(req: Request, res: Response) {
        const response: DefaultResponse<any> = await safeExecute(async () => {
            const topics = await TopicService.getAll();
            return { status: 200, data: topics, message: 'Danh sách chủ đề' };
        });

        res.status(response.status).json(response);
    },

    // Tạo mới topic
    async create(req: Request, res: Response) {
        const response: DefaultResponse<any> = await safeExecute(async () => {
            const newTopic = await TopicService.create(req.body);
            return { status: 201, data: newTopic, message: 'Tạo chủ đề thành công' };
        });

        res.status(response.status).json(response);
    },

    // Cập nhật topic
    async update(req: Request, res: Response) {
        const id = Number(req.params.id);

        const response: DefaultResponse<any> = await safeExecute(async () => {
            const updated = await TopicService.update(id, req.body);
            return { status: 202, data: updated, message: 'Cập nhật chủ đề thành công' };
        });

        if (response.error === 'TOPIC_NOT_FOUND') {
            response.status = 404;
            response.message = 'Không tìm thấy chủ đề để cập nhật';
            delete response.error;
        }

        res.status(response.status).json(response);
    },

    // Xóa topic
    async remove(req: Request, res: Response) {
        const id = Number(req.params.id);

        const response: DefaultResponse<any> = await safeExecute(async () => {
            await TopicService.remove(id);
            return { status: 204, message: 'Xóa chủ đề thành công' };
        });

        if (response.error === 'TOPIC_NOT_FOUND') {
            response.status = 404;
            response.message = 'Không tìm thấy chủ đề để xóa';
            delete response.error;
        }

        res.status(response.status).json(response);
    },
};

export default TopicController;
