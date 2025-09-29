import express from "express";
import { crearSeccionEncuesta, listarSeccionesEncuesta } from "../controllers/seccionesEncuestaController.js";
import { crearPreguntaEncuesta, listarPreguntasEncuesta } from "../controllers/preguntasEncuestaController.js";
import { previsualizarEncuesta } from "../controllers/previewEncuestaController.js";

const router = express.Router();

// Secciones
router.post("/:codigo_formulario/secciones", crearSeccionEncuesta);
router.get("/:codigo_formulario/secciones", listarSeccionesEncuesta);

// Preguntas
router.post("/secciones/:id_seccion/preguntas", crearPreguntaEncuesta);
router.get("/secciones/:id_seccion/preguntas", listarPreguntasEncuesta);

// Preview encuesta completa
router.get("/:codigo_formulario/preview", previsualizarEncuesta);

export default router;
