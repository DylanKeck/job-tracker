import type { Request, Response } from "express";
import { ok, serverError } from "../utils/response.utils.js";
import { pingDb } from "../utils/database.utils.js";

export async function healthController(_req: Request, res: Response) {
    try {
        await pingDb();
        ok(res, { ok: true });
    } catch (e) { serverError(res, e); }
}
