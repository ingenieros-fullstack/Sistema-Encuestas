import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { listarAsignacionesEmpleado } from "../controllers/empleado.controller.js";
const router = Router();

// Dashboard Empleado
router.get("/dashboard", authMiddleware(["empleado"]), (req, res) => {
  res.json({
    message: "Bienvenido al dashboard de EMPLEADO 👷",
    usuario: req.user,
  });
});
// Solo empleados autenticados
router.get(
  "/asignaciones",
  authMiddleware(["empleado"]),
  listarAsignacionesEmpleado
);
export default router;
