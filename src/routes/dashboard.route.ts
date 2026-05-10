import { Router } from "express";
import Authentication from "../middleware/authentication";
import { ADMIN } from "../config/permission";
import DashboardController from "../controllers/dashboard.controller";

const dashBoardRoute = Router();

dashBoardRoute.get('/card',
    Authentication.AuthenticateToken,
    Authentication.AuthorizeRoles(...ADMIN),
    DashboardController.getDashboardStatsCard
)

dashBoardRoute.get('/line',
    Authentication.AuthenticateToken,
    Authentication.AuthorizeRoles(...ADMIN),
    DashboardController.getDashboardStatsLine
)

dashBoardRoute.get('/active-users',
    Authentication.AuthenticateToken,
    Authentication.AuthorizeRoles(...ADMIN),
    DashboardController.getDashboardStatsBar
)

dashBoardRoute.get('/pie',
    Authentication.AuthenticateToken,
    Authentication.AuthorizeRoles(...ADMIN),
    DashboardController.getDashboardStatsPie
)

dashBoardRoute.get('/table',
    Authentication.AuthenticateToken,
    Authentication.AuthorizeRoles(...ADMIN),
    DashboardController.getDashboardStatsTable
)

export default dashBoardRoute

