import { Router } from "express";  
import { authMiddleware } from "../middleware/auth.middleware.js";  
import {   
  getCuestionarioPreview,   
  listarRespuestasCuestionario   
} from "../controllers/cuestionario.controller.js";  
  
import {   
  crearSeccion,   
  actualizarSeccion,     
  eliminarSeccion        
} from "../controllers/seccion.controller.js";  
  
import {   
  crearPregunta,   
  actualizarPregunta,    
  eliminarPregunta       
} from "../controllers/pregunta.controller.js";  
  
const router = Router();  
  
// ================== CUESTIONARIOS ==================  
router.get("/:codigo/preview", authMiddleware(["admin"]), getCuestionarioPreview);  
router.get("/:codigo/respuestas", authMiddleware(["admin","supervisor"]), listarRespuestasCuestionario);  
  
// ================== SECCIONES ==================  
router.post("/secciones", authMiddleware(["admin"]), crearSeccion);  
router.put("/secciones/:id", authMiddleware(["admin"]), actualizarSeccion);  
router.delete("/secciones/:id", authMiddleware(["admin"]), eliminarSeccion);  
  
// ================== PREGUNTAS ==================  
router.post("/preguntas", authMiddleware(["admin"]), crearPregunta);  
router.put("/preguntas/:id", authMiddleware(["admin"]), actualizarPregunta);  
router.delete("/preguntas/:id", authMiddleware(["admin"]), eliminarPregunta);  
  
export default router;