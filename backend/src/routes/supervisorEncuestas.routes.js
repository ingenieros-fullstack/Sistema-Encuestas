import express from "express";
import { obtenerEncuestaSupervisor, responderEncuestaSupervisor } from "../controllers/supervisorEncuestaController.js";

const router = express.Router();

router.get("/:codigo_formulario", obtenerEncuestaSupervisor);
router.post("/:codigo_formulario/responder", responderEncuestaSupervisor);

export default router;
