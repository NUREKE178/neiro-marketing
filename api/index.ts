// Vercel serverless entry point. Reuses the same Express app as local dev
// (server/src/app.ts) — an Express app is already a valid (req, res) HTTP
// handler, so no adapter is needed. Routing to this file for every
// /api/* path is configured in vercel.json's rewrites.
import { app } from "../server/src/app.js";

export default app;
