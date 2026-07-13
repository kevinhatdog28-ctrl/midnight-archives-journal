import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dreamsRouter from "./dreams";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dreamsRouter);

export default router;
