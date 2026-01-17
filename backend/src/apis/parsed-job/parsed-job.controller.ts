// backend/src/api/parsed-job/parsed-job.controller.ts
import type { Request, Response } from "express";
import { z } from "zod";
import { ParsedJobSchema, parseJobFromUrl } from "./parsed-job.model";

const ImportRequestSchema = z.object({
    url: z.string().url("Please provide a valid URL"),
});

export async function importParsedJobFromUrl(req: Request, res: Response) {
    try {
        const parsedReq = ImportRequestSchema.safeParse(req.body);
        if (!parsedReq.success) {
            return res.status(400).json({ errors: parsedReq.error.format() });
        }

        const { url } = parsedReq.data;

        const parsedJob = await parseJobFromUrl(url);

        // Validate response just to be safe (defensive)
        const safeJob = ParsedJobSchema.parse(parsedJob);

        return res.status(200).json({ job: safeJob });
    } catch (err: any) {
        console.error("[parsed-job] import error:", err);
        return res.status(500).json({
            error: "Failed to import job from URL. Try again or paste details manually.",
        });
    }
}
