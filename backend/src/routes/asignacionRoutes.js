import { Router } from "express";
import { crearAsignaciones, listarAsignaciones } from "../controllers/asignacion.Controller.js";

const router = Router();

router.post("/", crearAsignaciones);   // POST /asignaciones
router.get("/", listarAsignaciones);   // GET /asignaciones

export default router;
