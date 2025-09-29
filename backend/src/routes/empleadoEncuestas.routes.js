import express from "express";
import { obtenerEncuestaEmpleado, responderEncuestaEmpleado } from "../controllers/empleadoEncuestaController.js";

const router = express.Router();

router.get("/:codigo_formulario", obtenerEncuestaEmpleado);
router.post("/:codigo_formulario/responder", responderEncuestaEmpleado);

export default router;
