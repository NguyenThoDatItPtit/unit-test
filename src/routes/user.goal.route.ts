import { Router } from "express";
import { UserGoalController } from "../controllers/user.goal.controller";
import  Authentication  from "../middleware/authentication"

const userGoalRoute = Router();

userGoalRoute.get(
    "/",
    Authentication.AuthenticateToken,
    UserGoalController.getAll
);

userGoalRoute.post(
    "/create",
    Authentication.AuthenticateToken,
    UserGoalController.create
);

userGoalRoute.delete(
    "/delete/:id",
    Authentication.AuthenticateToken,
    UserGoalController.delete
);


export default userGoalRoute;