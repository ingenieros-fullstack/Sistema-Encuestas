import { Router } from "express";
import { previsualizarEncuesta } from "../controllers/previewEncuestaController.js";
import { getCuestionarioPreview } from "../controllers/cuestionario.controller.js";

const router = Router();

// QR de Encuestas (público)
router.get("/resolver/encuesta/:codigo", (req, res) => {
  return previsualizarEncuesta(req, res);
});

// QR de Cuestionarios (público)
router.get("/resolver/cuestionario/:codigo", (req, res) => {
  return getCuestionarioPreview(req, res);
});

export default router;
