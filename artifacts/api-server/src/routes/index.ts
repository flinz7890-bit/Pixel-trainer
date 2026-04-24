import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pvpRouter from "./pvp";

const router: IRouter = Router();

router.use(healthRouter);
router.use(pvpRouter);

export default router;
