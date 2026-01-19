// backend/src/api/parsed-job/parsed-job.route.ts
import { Router } from "express";
import { importParsedJobFromUrl } from "./parsed-job.controller";

const basePath = "/api/parsed-job";
const router = Router();

// POST /api/parsed-job/import-from-url
router.route("/:import-from-url").post(importParsedJobFromUrl);

export const parsedJobRoute = { basePath, router };
