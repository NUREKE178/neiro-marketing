import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./routes.js";

export const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router);
app.get("/api/health", (_req, res) => res.json({ ok: true }));
