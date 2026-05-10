import RoadmapController from "../controllers/roadmap.controller";
import Authentication from '../middleware/authentication';
import { ADMIN } from "../config/permission";
import { Router } from 'express';

const roadmapRouter = Router();

roadmapRouter.get("/",
    Authentication.AuthenticateToken,
    RoadmapController.getAll
)

roadmapRouter.get("/:id",
    Authentication.AuthenticateToken,
    Authentication.AuthorizeRoles(...ADMIN),
    RoadmapController.getById
)

roadmapRouter.post("/create",
    Authentication.AuthenticateToken,
    Authentication.AuthorizeRoles(...ADMIN),
    RoadmapController.create
)

roadmapRouter.delete("/remove/:id",
    Authentication.AuthenticateToken,
    Authentication.AuthorizeRoles(...ADMIN),
    RoadmapController.delete
)

roadmapRouter.patch("/update/:id",
    Authentication.AuthenticateToken,
    Authentication.AuthorizeRoles(...ADMIN),
    RoadmapController.update
)

export default roadmapRouter