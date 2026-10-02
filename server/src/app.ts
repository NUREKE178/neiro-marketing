import "dotenv/config";
import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { testsRouter } from "./routes/tests.js";

export const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/api/tests", testsRouter);
app.get("/api/config/status", (_req, res) => {
  res.json({ aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY) });
});
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Without this, an error passed to next(err) anywhere in routes falls
// through to Express's default HTML error page — the client's fetch wrapper
// expects JSON and silently loses the real message, surfacing only a bare
// "request failed (500)". Keep this last so it only catches what the routes
// didn't already handle themselves.
const jsonErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: "Күтпеген сервер қатесі орын алды.",
    detail: err instanceof Error ? err.message : String(err),
  });
};
app.use(jsonErrorHandler);
