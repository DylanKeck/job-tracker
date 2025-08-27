import type { Request, Response } from "express";
import { pool } from "../../utils/database.utils";
import { ok, badRequest, serverError } from "../../utils/response.utils";

export async function listJobs(_req: Request, res: Response) {
    try {
        const { rows } = await pool.query(
            "select id, company, role, status, applied_on from jobs order by created_at desc limit 50"
        );
        ok(res, rows);
    } catch (e) { serverError(res, e); }
}

export async function createJob(req: Request, res: Response) {
    try {
        const { company, role, status = "saved", applied_on = null } = req.body ?? {};
        if (!company || !role) return badRequest(res, "company and role required");
        const { rows } = await pool.query(
            "insert into jobs (company, role, status, applied_on) values ($1,$2,$3,$4) returning *",
            [company, role, status, applied_on]
        );
        ok(res, rows[0], 201);
    } catch (e) { serverError(res, e); }
}
