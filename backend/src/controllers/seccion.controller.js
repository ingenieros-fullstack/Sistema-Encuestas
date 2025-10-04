import Seccion from "../models/Seccion.js";  
  
// ✅ Crear sección  
export const crearSeccion = async (req, res) => {  
  try {  
    const { codigo_formulario, nombre_seccion, tema } = req.body;  
      
    // Validación básica  
    if (!codigo_formulario || !nombre_seccion) {  
      return res.status(400).json({   
        error: "Faltan campos requeridos: codigo_formulario y nombre_seccion"   
      });  
    }  
  
    const seccion = await Seccion.create({   
      codigo_formulario,   
      nombre_seccion,  
      tema: tema || null  
    });  
      
    res.status(201).json({ seccion });  
  } catch (err) {  
    console.error("❌ Error al crear sección:", err);  
    res.status(500).json({ error: err.message });  
  }  
};  
  
// ✅ Actualizar sección  
export const actualizarSeccion = async (req, res) => {  
  try {  
    const { id } = req.params;  
    const { nombre_seccion, tema } = req.body;  
  
    const seccion = await Seccion.findByPk(id);  
    if (!seccion) {  
      return res.status(404).json({ error: "Sección no encontrada" });  
    }  
  
    // Solo actualizar campos que se enviaron  
    if (nombre_seccion !== undefined) seccion.nombre_seccion = nombre_seccion;  
    if (tema !== undefined) seccion.tema = tema;  
      
    await seccion.save();  
  
    res.json({ message: "Sección actualizada", seccion });  
  } catch (err) {  
    console.error("❌ Error al actualizar sección:", err);  
    res.status(500).json({ error: err.message });  
  }  
};  
  
// ✅ Eliminar sección  
export const eliminarSeccion = async (req, res) => {  
  try {  
    const { id } = req.params;  
      
    const seccion = await Seccion.findByPk(id);  
    if (!seccion) {  
      return res.status(404).json({ error: "Sección no encontrada" });  
    }  
  
    // Las preguntas se eliminan automáticamente por CASCADE  
    await seccion.destroy();  
      
    res.json({ message: "Sección eliminada exitosamente" });  
  } catch (err) {  
    console.error("❌ Error al eliminar sección:", err);  
    res.status(500).json({ error: err.message });  
  }  
};