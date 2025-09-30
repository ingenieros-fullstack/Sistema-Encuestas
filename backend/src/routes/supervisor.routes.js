import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { listarAsignacionesSupervisor } from "../controllers/supervisor.controller.js";

const router = Router();

// Dashboard Supervisor
router.get("/dashboard", authMiddleware(["supervisor"]), (req, res) => {
  res.json({
    message: "Bienvenido al dashboard de SUPERVISOR 🛠️",
    usuario: req.user,
  });
});

// 📋 Formularios asignados al supervisor
router.get(
  "/asignaciones",
  authMiddleware(["supervisor"]),
  listarAsignacionesSupervisor
);

export default router;
