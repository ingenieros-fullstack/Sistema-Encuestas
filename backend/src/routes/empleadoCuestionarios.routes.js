import { Router } from "express";  
import { authMiddleware } from "../middleware/auth.middleware.js";  
import { getCuestionarioPreview, resolverCuestionario } from "../controllers/cuestionario.controller.js";  
import Asignacion from "../models/Asignacion.js";  
  
const router = Router();  
  
// GET cuestionario para resolver (empleado)  
router.get("/:codigo", authMiddleware(["empleado"]), async (req, res) => {  
  try {  
    const { codigo } = req.params;  
    const id_usuario = req.user.id_usuario;  
  
    // Verificar que el empleado tenga asignado este cuestionario  
    const asignacion = await Asignacion.findOne({  
      where: {   
        id_usuario,   
        codigo_formulario: codigo   
      },  
    });  
      
    if (!asignacion) {  
      return res.status(403).json({   
        error: "No tienes acceso a este cuestionario"   
      });  
    }  
  
    // 🆕 Verificar si ya está completado  
    if (asignacion.estado === "completado") {  
      return res.status(403).json({   
        error: "Este cuestionario ya fue completado",  
        completado: true  
      });  
    }  
  
    // Reutilizar el controlador existente  
    return getCuestionarioPreview(req, res);  
  } catch (err) {  
    console.error("Error getCuestionarioParaResolver:", err);  
    return res.status(500).json({ error: "Error interno del servidor" });  
  }  
});  
  
// POST guardar respuestas del cuestionario  
router.post("/:codigo/respuestas", authMiddleware(["empleado"]), async (req, res) => {  
  try {  
    const { codigo } = req.params;  
    const id_usuario = req.user.id_usuario;  
    const { respuestas } = req.body;  
  
    // Buscar la asignación del empleado  
    const asignacion = await Asignacion.findOne({  
      where: { id_usuario, codigo_formulario: codigo },  
    });  
      
    if (!asignacion) {  
      return res.status(403).json({ error: "No tienes acceso a este cuestionario" });  
    }  
  
    // Verificar que no esté ya completado  
    if (asignacion.estado === "completado") {  
      return res.status(403).json({   
        error: "Este cuestionario ya fue completado anteriormente"   
      });  
    }  
  
    // Llamar al controlador existente con el id_asignacion  
    req.body.id_asignacion = asignacion.id_asignacion;  
    return resolverCuestionario(req, res);  
  } catch (err) {  
    console.error("Error guardando respuestas cuestionario:", err);  
    return res.status(500).json({ error: "Error interno del servidor" });  
  }  
});  
  
export default router;