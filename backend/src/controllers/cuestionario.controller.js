import Formulario from "../models/Formulario.js";  
import Seccion from "../models/Seccion.js";  
import Pregunta from "../models/Pregunta.js";  
import Opcion from "../models/Opcion.js";  
import Asignacion from "../models/Asignacion.js";  
import Respuesta from "../models/Respuesta.js";  
  
// ======================================  
// Preview del cuestionario (con opciones)  
// ======================================  
export const getCuestionarioPreview = async (req, res) => {  
  try {  
    const { codigo } = req.params;  
  
    const cuestionario = await Formulario.findOne({  
      where: { codigo },  
      include: [  
        {  
          model: Seccion,  
          as: "Secciones",  
          include: [  
            {  
              model: Pregunta,  
              as: "Preguntas",  
              include: [  
                {  
                  model: Opcion,  
                  as: "Opciones", // ✅ IMPORTANTE: Usar "Opciones" con mayúscula  
                  attributes: ["id_opcion", "texto", "valor"]  
                }  
              ]  
            }  
          ]  
        }  
      ]  
    });  
  
    if (!cuestionario) {  
      return res.status(404).json({ message: "Cuestionario no encontrado" });  
    }  
  
    // ✅ Transformar opciones de array a string separado por ";"  
    // para mantener compatibilidad con el frontend  
    if (cuestionario.Secciones) {  
      cuestionario.Secciones.forEach(seccion => {  
        if (seccion.Preguntas) {  
          seccion.Preguntas.forEach(pregunta => {  
            if (pregunta.Opciones && pregunta.Opciones.length > 0) {  
              // Convertir array de opciones a string separado por ";"  
              pregunta.dataValues.opciones = pregunta.Opciones  
                .map(op => op.texto)  
                .join(";");  
            } else {  
              pregunta.dataValues.opciones = null;  
            }  
            // Eliminar el array de Opciones para evitar duplicación  
            delete pregunta.dataValues.Opciones;  
          });  
        }  
      });  
    }  
  
    res.json(cuestionario);  
  } catch (error) {  
    console.error('Error al obtener preview:', error);  
    res.status(500).json({ message: error.message });  
  }  
};  
  
// ======================================  
// Previsualizar cuestionario (empleado)  
// ======================================  
export const previsualizarCuestionario = async (req, res) => {  
  try {  
    const { codigo } = req.params;  
    const id_usuario = req.user.id_usuario;  
  
    // Verificar si el usuario tiene asignación para este cuestionario  
    const asignacion = await Asignacion.findOne({  
      where: {   
        id_usuario,   
        codigo_formulario: codigo,  
        estado: 'pendiente'  
      }  
    });  
  
    if (!asignacion) {  
      return res.status(403).json({   
        message: "No tienes asignación para este cuestionario o ya fue completado"   
      });  
    }  
  
    const cuestionario = await Formulario.findOne({  
      where: { codigo },  
      include: [  
        {  
          model: Seccion,  
          as: "Secciones",  
          include: [  
            {  
              model: Pregunta,  
              as: "Preguntas",  
              include: [  
                {  
                  model: Opcion,  
                  as: "Opciones",  
                  attributes: ["id_opcion", "texto", "valor"]  
                }  
              ]  
            }  
          ]  
        }  
      ]  
    });  
  
    if (!cuestionario) {  
      return res.status(404).json({ message: "Cuestionario no encontrado" });  
    }  
  
    // Transformar opciones para el frontend  
    if (cuestionario.Secciones) {  
      cuestionario.Secciones.forEach(seccion => {  
        if (seccion.Preguntas) {  
          seccion.Preguntas.forEach(pregunta => {  
            if (pregunta.Opciones && pregunta.Opciones.length > 0) {  
              pregunta.dataValues.opciones = pregunta.Opciones  
                .map(op => op.texto)  
                .join(";");  
            } else {  
              pregunta.dataValues.opciones = null;  
            }  
            delete pregunta.dataValues.Opciones;  
            // No mostrar respuesta correcta al empleado  
            delete pregunta.dataValues.respuesta_correcta;  
          });  
        }  
      });  
    }  
  
    res.json({  
      cuestionario,  
      id_asignacion: asignacion.id_asignacion  
    });  
  } catch (error) {  
    console.error('Error al previsualizar cuestionario:', error);  
    res.status(500).json({ message: error.message });  
  }  
};  
  
// ======================================  
// Resolver cuestionario (empleado)  
// ======================================  
export const resolverCuestionario = async (req, res) => {  
  try {  
    const { id_asignacion, respuestas } = req.body;  
    const id_usuario = req.user.id_usuario;  
  
    // Verificar que la asignación pertenece al usuario  
    const asignacion = await Asignacion.findOne({  
      where: {   
        id_asignacion,   
        id_usuario,  
        estado: 'pendiente'  
      }  
    });  
  
    if (!asignacion) {  
      return res.status(403).json({   
        message: "Asignación no encontrada o ya completada"   
      });  
    }  
  
    // Guardar respuestas  
    for (const resp of respuestas) {  
      await Respuesta.create({  
        id_asignacion,  
        id_pregunta: resp.id_pregunta,  
        respuesta: resp.respuesta  
      });  
    }  
  
    // Actualizar estado de asignación  
    await asignacion.update({   
      estado: 'completado',  
      fecha_completado: new Date()  
    });  
  
    res.json({ message: "Cuestionario completado exitosamente" });  
  } catch (error) {  
    console.error('Error al resolver cuestionario:', error);  
    res.status(500).json({ message: error.message });  
  }  
};  
  
// ======================================  
// Listar respuestas de cuestionario  
// ======================================  
export const listarRespuestasCuestionario = async (req, res) => {  
  try {  
    const { codigo } = req.params;  
  
    const asignaciones = await Asignacion.findAll({  
      where: { codigo_formulario: codigo },  
      include: [  
        {  
          model: Respuesta,  
          as: "Respuestas",  
          include: [  
            {  
              model: Pregunta,  
              as: "Pregunta",  
              attributes: ["id_pregunta", "enunciado", "tipo_pregunta", "respuesta_correcta"]  
            }  
          ]  
        }  
      ]  
    });  
  
    res.json(asignaciones);  
  } catch (error) {  
    console.error('Error al listar respuestas:', error);  
    res.status(500).json({ message: error.message });  
  }  
};