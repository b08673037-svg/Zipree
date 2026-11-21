// Health check — the smoke test for Phase 1.
// Proves the server boots, routes wire up, and the app responds.

import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "zipree-api",
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

export default router;