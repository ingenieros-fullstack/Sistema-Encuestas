import express from "express";
import { listarAsignacionesPorUsuario } from "../controllers/asignacionController.js";

const router = express.Router();

// Listar asignaciones de un supervisor
router.get("/:id_usuario", listarAsignacionesPorUsuario);

export default router;
