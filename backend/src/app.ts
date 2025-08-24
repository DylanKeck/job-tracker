import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";



dotenv.config()
const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true, credentials: true }))
app.use(express.json())

app.get("/health", (_req, res) => res.json({ ok: true }))
app.use("/", routes)

export default app