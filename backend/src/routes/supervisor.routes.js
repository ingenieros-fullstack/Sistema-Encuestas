import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Dashboard Supervisor
router.get("/dashboard", authMiddleware(["supervisor"]), (req, res) => {
  res.json({
    message: "Bienvenido al dashboard de SUPERVISOR 🛠️",
    usuario: req.user,
  });
});

export default router;
