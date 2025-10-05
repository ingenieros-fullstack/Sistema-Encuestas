import Formulario from "../models/Formulario.js";  
import Seccion from "../models/Seccion.js";  
import Pregunta from "../models/Pregunta.js";  
import Opcion from "../models/Opcion.js";  
import Respuesta from "../models/Respuesta.js";  
import Asignacion from "../models/Asignacion.js"; 
import Usuario from "../models/Usuario.js";        // 🆕 AGREGAR  
import DataEmpleado from "../models/DataEmpleado.js"; // 🆕 AGREGAR 
  
// ✅ Obtener cuestionario con secciones y preguntas (INCLUYE OPCIONES)  
export const getCuestionarioPreview = async (req, res) => {  
  try {  
    const { codigo } = req.params;  
  
    const cuestionario = await Formulario.findOne({  
      where: { codigo, tipo: "Cuestionario" },  
      include: [  
        {  
          model: Seccion,  
          as: "Secciones",  
          include: [  
            {  
              model: Pregunta,  
              as: "Preguntas",  
              attributes: [  
                "id_pregunta",  
                "id_seccion",  
                "enunciado",  
                "tipo_pregunta",  
                "obligatoria",  
                "puntaje",  
                "respuesta_correcta",  
                "created_at",  
              ],  
              include: [  
                {  
                  model: Opcion,  
                  as: "Opciones",  
                  attributes: ["id_opcion", "texto", "valor"]  
                }  
              ]  
            },  
          ],  
        },  
      ],  
    });  
  
    if (!cuestionario) {  
      return res.status(404).json({ error: "Cuestionario no encontrado" });  
    }  
  
    // 🔄 Transformar opciones de array a string separado por ";"  
    if (cuestionario.Secciones) {  
      cuestionario.Secciones.forEach(seccion => {  
        if (seccion.Preguntas) {  
          seccion.Preguntas.forEach(pregunta => {  
            if (pregunta.Opciones && pregunta.Opciones.length > 0) {  
              const opcionesString = pregunta.Opciones  
                .map(opt => opt.texto)  
                .join(";");  
              pregunta.dataValues.opciones = opcionesString;  
            } else {  
              pregunta.dataValues.opciones = null;  
            }  
          });  
        }  
      });  
    }  
  
    return res.json(cuestionario);  
  } catch (err) {  
    console.error("❌ Error getCuestionarioPreview:", err);  
    return res.status(500).json({ error: err.message });  
  }  
};  
  
// ✅ Resolver cuestionario (empleado) - VERSIÓN CORREGIDA  
export const resolverCuestionario = async (req, res) => {  
  try {  
    const { id_asignacion, respuestas } = req.body;  
  
    const asignacion = await Asignacion.findByPk(id_asignacion);  
    if (!asignacion) {  
      return res.status(404).json({ error: "Asignación no encontrada" });  
    }  
  
    let puntajeTotal = 0;  
    const respuestasDetalle = [];  
  
    for (const r of respuestas) {  
      const pregunta = await Pregunta.findByPk(r.id_pregunta);  
      if (!pregunta) continue;  
  
      let es_correcta = null;  
      let puntaje_obtenido = 0;  
  
      if (pregunta.respuesta_correcta) {  
        // Normalizar ambas respuestas para comparación  
        const respuestaUsuario = String(r.respuesta).trim().toLowerCase();  
        const respuestaCorrecta = String(pregunta.respuesta_correcta).trim().toLowerCase();  
          
        // Para opciones múltiples, ordenar antes de comparar  
        if (pregunta.tipo_pregunta === "opcion_multiple") {  
          const opcionesUsuario = respuestaUsuario.split(";").map(o => o.trim()).sort().join(";");  
          const opcionesCorrectas = respuestaCorrecta.split(";").map(o => o.trim()).sort().join(";");  
          es_correcta = opcionesUsuario === opcionesCorrectas;  
        } else {  
          es_correcta = respuestaUsuario === respuestaCorrecta;  
        }  
          
        puntaje_obtenido = es_correcta ? (pregunta.puntaje || 0) : 0;  
        puntajeTotal += puntaje_obtenido;  
      }  
  
      await Respuesta.create({  
        id_asignacion,  
        id_pregunta: r.id_pregunta,  
        respuesta: r.respuesta,  
        es_correcta,  
        puntaje_obtenido,  
      });  
  
      respuestasDetalle.push({  
        id_pregunta: r.id_pregunta,  
        es_correcta,  
        puntaje_obtenido,  
      });  
    }  
  
    asignacion.estado = "completado";  
    asignacion.fecha_respuesta = new Date();  
    await asignacion.save();  
  
    return res.json({  
      message: "Cuestionario resuelto",  
      puntajeTotal,  
      respuestas: respuestasDetalle,  
    });  
  } catch (err) {  
    console.error("❌ Error resolverCuestionario:", err);  
    return res.status(500).json({ error: err.message });  
  }  
};  
  

// ✅ Listar respuestas de un cuestionario (admin/supervisor)  
export const listarRespuestasCuestionario = async (req, res) => {  
  try {  
    const { codigo } = req.params;  
    const { usuario } = req.query;  
  
    // Si viene parámetro usuario, devolver detalle de ese empleado  
    if (usuario) {  
      const asignacion = await Asignacion.findOne({  
        where: {   
          id_usuario: usuario,   
          codigo_formulario: codigo   
        },  
        include: [  
          {  
            model: Usuario,  
            include: [{ model: DataEmpleado, as: "empleado" }],  
          },  
        ],  
      });  
  
      if (!asignacion) {  
        return res.status(404).json({ error: "Asignación no encontrada" });  
      }  
  
      const respuestas = await Respuesta.findAll({  
        where: { id_asignacion: asignacion.id_asignacion },  
        include: [{ model: Pregunta, as: "Pregunta" }],  
      });  
  
      const cuestionario = await Formulario.findOne({  
        where: { codigo },  
      });  
  
      const puntajeTotal = respuestas.reduce(  
        (sum, r) => sum + (r.puntaje_obtenido || 0),  
        0  
      );  
  
      const umbral = cuestionario?.umbral_aprobacion || 0;  
      const aprobado = puntajeTotal >= umbral;  
  
      return res.json({  
        empleado: {  
          nombre: asignacion.Usuario?.empleado?.nombre || "N/A",  
          correo: asignacion.Usuario?.correo_electronico || "N/A",  
        },  
        puntajeTotal,  
        aprobado,  
        respuestas: respuestas.map((r) => ({  
          id_pregunta: r.id_pregunta,  
          pregunta: r.Pregunta?.enunciado || "N/A",  
          respuesta: r.respuesta,  
          es_correcta: r.es_correcta,  
          puntaje_obtenido: r.puntaje_obtenido || 0,  
          puntaje_total: r.Pregunta?.puntaje || 0,  
        })),  
      });  
    }  
  
    // Sin parámetro usuario: devolver lista de empleados  
    const asignaciones = await Asignacion.findAll({  
      where: { codigo_formulario: codigo },  
      include: [  
        {  
          model: Usuario,  
          include: [{ model: DataEmpleado, as: "empleado" }],  
        },  
      ],  
    });  
  
    const empleadosConPuntaje = await Promise.all(  
      asignaciones.map(async (a) => {  
        let puntaje_total = 0;  
  
        if (a.estado === "completado") {  
          const respuestas = await Respuesta.findAll({  
            where: { id_asignacion: a.id_asignacion },  
          });  
          puntaje_total = respuestas.reduce(  
            (sum, r) => sum + (r.puntaje_obtenido || 0),  
            0  
          );  
        }  
  
        return {  
          id_usuario: a.id_usuario,  
          nombre: a.Usuario?.empleado?.nombre || "N/A",  
          correo: a.Usuario?.correo_electronico || "N/A",  
          estado: a.estado,  
          puntaje_total,  
          fecha_respuesta: a.fecha_respuesta,  
        };  
      })  
    );  
  
    return res.json({ empleados: empleadosConPuntaje });  
  } catch (err) {  
    console.error("❌ Error listarRespuestasCuestionario:", err);  
    return res.status(500).json({ error: err.message });  
  }  
};