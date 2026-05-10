import { Request, Response } from "express";
import { DashBoardService } from "../services/dashboard.service";
import { DefaultResponse } from "../utils/safe.execute";
import safeExecute from "../utils/safe.execute";

const DashboardController = {
    /* CARD (OVERVIEW) */
    async getDashboardStatsCard(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            const { year, month } = req.query;

            if (!year || !month) {
                return {
                    status: 400,
                    message: "Thiếu year hoặc month",
                    data: null,
                };
            }

            const data = await DashBoardService.getDashboardStatsCard({
                year: Number(year),
                month: Number(month),
            });

            return {
                status: 200,
                message: "Lấy dữ liệu dashboard thành công",
                data,
            };
        });

        return res.status(result.status).json(result);
    },

    /* LINE */
    async getDashboardStatsLine(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            const data = await DashBoardService.getDashboardStatsLine();

            return {
                status: 200,
                message: "Lấy dữ liệu biểu đồ theo thời gian thành công",
                data,
            };
        });

        return res.status(result.status).json(result);
    },

    /* BAR (DAU / WAU / MAU) */
    async getDashboardStatsBar(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            const data = await DashBoardService.getDashboardStatsBar();

            return {
                status: 200,
                message: "Lấy dữ liệu biểu đồ người dùng hoạt động thành công",
                data,
            };
        });

        return res.status(result.status).json(result);
    },

    /* PIE */
    async getDashboardStatsPie(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            const data = await DashBoardService.getDashboardStatsPie();

            return {
                status: 200,
                message: "Lấy dữ liệu biểu đồ tỉ lệ thành công",
                data,
            };
        });

        return res.status(result.status).json(result);
    },

    /* TABLE */
    async getDashboardStatsTable(req: Request, res: Response) {
        const result: DefaultResponse<any> = await safeExecute(async () => {
            const data = await DashBoardService.getDashboardStatsTable();

            return {
                status: 200,
                message: "Lấy dữ liệu bảng thống kê dashboard thành công",
                data,
            };
        });

        return res.status(result.status).json(result);
    },
};

export default DashboardController;
