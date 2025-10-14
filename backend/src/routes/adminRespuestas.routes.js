import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getRespuestasPorUsuario } from "../controllers/adminRespuestasController.js";

const router = express.Router();

console.log("📘 adminRespuestas.routes.js cargado correctamente");

// 🔹 Obtener todas las respuestas de un usuario a una encuesta
router.get("/:codigo/respuestas", authMiddleware("admin"), (req, res, next) => {
  console.log("🧾 [GET] /:codigo/respuestas -> getRespuestasPorUsuario()");
  getRespuestasPorUsuario(req, res, next);
});

export default router;
