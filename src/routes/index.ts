import { Router } from 'express';

// routes
import roleRouter from './role.route';
import userRouter from './user.route';
import authRouter from './auth.route';
import questionRouter from './question.route';
import documentRoute from './document.route';
import subjectRoute from './subject.route';
import flashcardRouter from './flashcard.route';
import topicRouter from './topic.route';
import examRoute from './exam.route';
import bankRoute from './bank.route';
import fileRouter from './file.route';
import roadmapRouter from './roadmap.route';
import scheduleStudyRouter from './schedule.study.route';
import userGoalRoute from './user.goal.route';
import microserviceRouter from './microservice.route';
import dashBoardRoute from './dashboard.route';
const router = Router();

router.use('/roles', roleRouter);
router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/questions', questionRouter);
router.use('/documents', documentRoute);
router.use('/subjects', subjectRoute);
router.use("/flashcards", flashcardRouter);
router.use("/topics", topicRouter);
router.use('/exams', examRoute);
router.use('/banks', bankRoute);
router.use("/file", fileRouter);
router.use("/roadmap", roadmapRouter);
router.use("/schedule/study", scheduleStudyRouter);
router.use("/goal", userGoalRoute);
router.use("/microservice", microserviceRouter);
router.use("/", authRouter);
router.use("/dashboard", dashBoardRoute);
export default router;
