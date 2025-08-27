import { Router } from "express";
import { healthController } from "./index.controller.js";
import jobsRouter from "./jobs/jobs.route";

const r = Router();
r.get("/health", healthController);
r.use("/jobs", jobsRouter);
export default r;
