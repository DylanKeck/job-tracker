import { Router } from "express";
const router = Router();
router.use("/auth", (await import("./auth.routes.js")).default);
router.use("/jobs", (await import("./jobs.routes.js")).default);
export default router;
