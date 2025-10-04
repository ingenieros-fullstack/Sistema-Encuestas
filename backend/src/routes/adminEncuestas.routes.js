import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  crearSeccionEncuesta,
  listarSeccionesEncuesta,
  actualizarSeccionEncuesta,
  eliminarSeccionEncuesta,
} from "../controllers/seccionesEncuestaController.js";

import {
  crearPreguntaEncuesta,
  listarPreguntasEncuesta,
  actualizarPreguntaEncuesta,
  eliminarPreguntaEncuesta, // ✅ nuevo método
} from "../controllers/preguntasEncuestaController.js";

import { previsualizarEncuesta } from "../controllers/previewEncuestaController.js";

const router = express.Router();

console.log("📘 adminEncuestas.routes.js cargado correctamente");

// ======== 🔹 SECCIONES ========

// Crear sección (puede ser condicional)
router.post("/:codigo_formulario/secciones", authMiddleware(), (req, res, next) => {
  console.log("🧩 [POST] /:codigo_formulario/secciones -> crearSeccionEncuesta()");
  crearSeccionEncuesta(req, res, next);
});

// Listar secciones con preguntas y opciones
router.get("/:codigo_formulario/secciones", authMiddleware(), (req, res, next) => {
  console.log("🧩 [GET] /:codigo_formulario/secciones -> listarSeccionesEncuesta()");
  listarSeccionesEncuesta(req, res, next);
});

// Actualizar sección (nombre, tema o condición)
router.put("/secciones/:id_seccion", authMiddleware(), (req, res, next) => {
  console.log("🧩 [PUT] /secciones/:id_seccion -> actualizarSeccionEncuesta()");
  actualizarSeccionEncuesta(req, res, next);
});

// Eliminar sección
router.delete("/secciones/:id_seccion", authMiddleware(), (req, res, next) => {
  console.log("🧩 [DELETE] /secciones/:id_seccion -> eliminarSeccionEncuesta()");
  eliminarSeccionEncuesta(req, res, next);
});

// ======== 🔹 PREGUNTAS ========

// Crear pregunta dentro de una sección
router.post("/secciones/:id_seccion/preguntas", authMiddleware(), (req, res, next) => {
  console.log("🧩 [POST] /secciones/:id_seccion/preguntas -> crearPreguntaEncuesta()");
  crearPreguntaEncuesta(req, res, next);
});

// Listar preguntas de una sección
router.get("/secciones/:id_seccion/preguntas", authMiddleware(), (req, res, next) => {
  console.log("🧩 [GET] /secciones/:id_seccion/preguntas -> listarPreguntasEncuesta()");
  listarPreguntasEncuesta(req, res, next);
});

// Actualizar pregunta
router.put("/preguntas/:id_pregunta", authMiddleware(), (req, res, next) => {
  console.log("🧩 [PUT] /preguntas/:id_pregunta -> actualizarPreguntaEncuesta()");
  actualizarPreguntaEncuesta(req, res, next);
});

// Eliminar pregunta
router.delete("/preguntas/:id_pregunta", authMiddleware(), (req, res, next) => {
  console.log("🧩 [DELETE] /preguntas/:id_pregunta -> eliminarPreguntaEncuesta()");
  eliminarPreguntaEncuesta(req, res, next);
});

// ======== 🔹 PREVISUALIZACIÓN ========

// Ver encuesta completa con secciones, preguntas y opciones
router.get("/:codigo_formulario/preview", authMiddleware(), (req, res, next) => {
  console.log("🧩 [GET] /:codigo_formulario/preview -> previsualizarEncuesta()");
  previsualizarEncuesta(req, res, next);
});

export default router;
