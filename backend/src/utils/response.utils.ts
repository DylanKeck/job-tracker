import type { Response } from "express";

export function ok<T>(res: Response, data: T, status = 200) {
    res.status(status).json({ status, message: null, data });
}
export function badRequest(res: Response, message = "Bad request") {
    res.status(400).json({ status: 400, message, data: null });
}
export function serverError(res: Response, error: unknown) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Server error", data: null });
}
