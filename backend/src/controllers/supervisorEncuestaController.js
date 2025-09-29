import Formulario from "../models/Formulario.js";
import Seccion from "../models/Seccion.js";
import Pregunta from "../models/Pregunta.js";
import Asignacion from "../models/Asignacion.js";
import Respuesta from "../models/Respuesta.js";

// ✅ Obtener encuesta asignada a un supervisor
export const obtenerEncuestaSupervisor = async (req, res) => {
  try {
    const { codigo_formulario } = req.params;
    const id_usuario = req.user?.id_usuario; // ⚠️ del JWT

    // Verificar asignación
    const asignacion = await Asignacion.findOne({ where: { id_usuario, codigo_formulario } });
    if (!asignacion) return res.status(403).json({ error: "Encuesta no asignada a este supervisor" });

    // Traer formulario con secciones y preguntas
    const encuesta = await Formulario.findOne({
      where: { codigo: codigo_formulario, tipo: "Encuesta" },
      include: [
        {
          model: Seccion,
          include: [Pregunta]
        }
      ]
    });

    res.json(encuesta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Guardar respuestas de supervisor
export const responderEncuestaSupervisor = async (req, res) => {
  try {
    const { codigo_formulario } = req.params;
    const id_usuario = req.user?.id_usuario;
    const { respuestas } = req.body; // [{id_pregunta, respuesta}, ...]

    const asignacion = await Asignacion.findOne({ where: { id_usuario, codigo_formulario } });
    if (!asignacion) return res.status(403).json({ error: "Encuesta no asignada a este supervisor" });

    for (const r of respuestas) {
      await Respuesta.create({
        id_asignacion: asignacion.id_asignacion,
        id_pregunta: r.id_pregunta,
        respuesta: r.respuesta
      });
    }

    // Marcar como completada
    await asignacion.update({ estado: "completado", fecha_respuesta: new Date() });

    res.json({ ok: true, message: "Encuesta respondida con éxito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
