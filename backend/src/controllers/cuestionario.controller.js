import Formulario from "../models/Formulario.js";
import Seccion from "../models/Seccion.js";
import Pregunta from "../models/Pregunta.js";
import Respuesta from "../models/Respuesta.js";
import Asignacion from "../models/Asignacion.js";
// ✅ Obtener cuestionario con secciones y preguntas
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
                "respuesta_correcta", // 👈 ahora viene en el JSON
                "created_at",
              ],
            },
          ],
        },
      ],
    });

    if (!cuestionario) {
      return res.status(404).json({ error: "Cuestionario no encontrado" });
    }

    return res.json(cuestionario);
  } catch (err) {
    console.error("❌ Error getCuestionarioPreview:", err);
    return res.status(500).json({ error: err.message });
  }
};


// ✅ Resolver cuestionario (empleado)
export const resolverCuestionario = async (req, res) => {
  try {
    const { id_asignacion, respuestas } = req.body;

    const asignacion = await Asignacion.findByPk(id_asignacion);
    if (!asignacion) {
      return res.status(404).json({ error: "Asignación no encontrada" });
    }

    let puntajeTotal = 0;

    for (const r of respuestas) {
      const pregunta = await Pregunta.findByPk(r.id_pregunta);
      if (!pregunta) continue;

      let es_correcta = null;
      let puntaje_obtenido = 0;

      // Solo si la pregunta tiene "respuesta_correcta" definida (caso cuestionario tipo examen)
      if (pregunta.respuesta_correcta) {
        es_correcta = r.respuesta.trim() === pregunta.respuesta_correcta.trim();
        puntaje_obtenido = es_correcta ? pregunta.puntaje || 0 : 0;
        puntajeTotal += puntaje_obtenido;
      }

      await Respuesta.create({
        id_asignacion,
        id_pregunta: r.id_pregunta,
        respuesta: r.respuesta,
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

    const respuestas = await Respuesta.findAll({
      include: [
        {
          model: Pregunta,
          as: "Pregunta", // 👈 alias definido en Pregunta.belongsTo(Seccion)
        },
        {
          model: Asignacion,
          where: { codigo_formulario: codigo },
        },
      ],
    });

    return res.json(respuestas);
  } catch (err) {
    console.error("❌ Error listarRespuestasCuestionario:", err);
    return res.status(500).json({ error: err.message });
  }
};
