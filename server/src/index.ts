import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./routes.js";
import "./db.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT ?? 8093);
app.listen(port, () => {
  console.log(`API SERVER STARTED on http://localhost:${port}`);
});
