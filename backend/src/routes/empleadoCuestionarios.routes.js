import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { previsualizarCuestionario, resolverCuestionario } from "../controllers/cuestionario.controller.js";

const router = Router();

router.get("/:codigo", authMiddleware(["empleado"]), previsualizarCuestionario);
router.post("/resolver", authMiddleware(["empleado"]), resolverCuestionario);

export default router;
