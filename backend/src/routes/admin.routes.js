import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/admin/dashboard", authMiddleware(["admin"]), (req, res) => {
  res.json({
    message: "Bienvenido al Dashboard Admin 🚀",
    user: req.user,
  });
});

export default router;
