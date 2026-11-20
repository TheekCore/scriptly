import { Router } from "express";

const router = Router();

// GET /api/health
// Unauthenticated health check route used by monitoring tools and during deployment
router.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

export default router;
