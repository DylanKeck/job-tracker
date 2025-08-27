import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./apis/index.route.js";

const app = express();

app.use(cors({ origin: (process.env.CORS_ORIGIN ?? "*").split(","), credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/", routes);

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
