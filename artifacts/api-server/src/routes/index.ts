import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import templatesRouter from "./templates";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(templatesRouter);
router.use(dashboardRouter);

export default router;
