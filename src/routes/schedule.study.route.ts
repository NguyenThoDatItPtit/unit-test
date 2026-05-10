import { Router } from "express";
import StudyScheduleController from "../controllers/schedule.study.controller"
import Authentication from "../middleware/authentication";

const scheduleStudyRouter = Router();

scheduleStudyRouter.get("/",
    Authentication.AuthenticateToken,
    StudyScheduleController.getAll);
    
scheduleStudyRouter.get("/filter",
    Authentication.AuthenticateToken,
    StudyScheduleController.filter);
scheduleStudyRouter.get("/:id", StudyScheduleController.getById);
scheduleStudyRouter.post("/create", StudyScheduleController.create);
scheduleStudyRouter.put("/update/:id", StudyScheduleController.update);
scheduleStudyRouter.delete("/remove/:id", StudyScheduleController.delete);

export default scheduleStudyRouter;
