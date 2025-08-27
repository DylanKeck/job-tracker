import { Router } from "express";
import { listJobs, createJob } from "./jobs.controller"
const r = Router();
r.get("/", listJobs);
r.post("/", createJob);
export default r;
