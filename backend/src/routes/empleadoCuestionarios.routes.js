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
  
    // Verificar si ya está completado  
    if (asignacion.estado === "completado") {  
      return res.status(403).json({   
        error: "Este cuestionario ya fue completado",  
        completado: true  
      });  
    }  
  
    // Reutilizar el controlador existente  
    return getCuestionarioPreview(req, res);  
  } catch (err) {  
    console.error("Error al obtener cuestionario:", err);  
    return res.status(500).json({ error: err.message });  
  }  
});  
  
// POST respuestas del cuestionario (empleado)  
router.post("/:codigo/respuestas", authMiddleware(["empleado"]), async (req, res) => {  
  try {  
    const { codigo } = req.params;  
    const id_usuario = req.user.id_usuario;  
  
    // Obtener la asignación  
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
  
    // Verificar si ya está completado  
    if (asignacion.estado === "completado") {  
      return res.status(403).json({   
        error: "Este cuestionario ya fue completado"  
      });  
    }  
  
    // Agregar id_asignacion al body  
    req.body.id_asignacion = asignacion.id_asignacion;  
  
    // Llamar al controlador de resolución  
    return resolverCuestionario(req, res);  
  } catch (err) {  
    console.error("Error al guardar respuestas:", err);  
    return res.status(500).json({ error: err.message });  
  }  
});  
  
export default router;