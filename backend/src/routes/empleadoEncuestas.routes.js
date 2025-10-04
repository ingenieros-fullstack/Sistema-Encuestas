import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  getEncuestaParaResolver,
  guardarRespuestasEncuesta,
} from "../controllers/empleadoEncuestasController.js";

const router = express.Router();

console.log("📘 empleadoEncuestas.routes.js cargado correctamente");

// ======== 🔹 EMPLEADO: ENCUESTAS ========

// Obtener encuesta completa (con secciones → preguntas → opciones)
router.get("/:codigo", authMiddleware(), (req, res, next) => {
  console.log("👤 [GET] /:codigo -> getEncuestaParaResolver()");
  getEncuestaParaResolver(req, res, next);
});

// Guardar respuestas (avance o finalización)
router.post("/:codigo/respuestas", authMiddleware(), (req, res, next) => {
  console.log("👤 [POST] /:codigo/respuestas -> guardarRespuestasEncuesta()");
  guardarRespuestasEncuesta(req, res, next);
});

export default router;
