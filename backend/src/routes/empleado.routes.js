import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Dashboard Empleado
router.get("/dashboard", authMiddleware(["empleado"]), (req, res) => {
  res.json({
    message: "Bienvenido al dashboard de EMPLEADO 👷",
    usuario: req.user,
  });
});

export default router;
