import Formulario from "../models/Formulario.js";
import Seccion from "../models/Seccion.js";
import Pregunta from "../models/Pregunta.js";
import Opcion from "../models/Opcion.js";
import Asignacion from "../models/Asignacion.js";
import Respuesta from "../models/Respuesta.js";

// 🔹 GET encuesta para resolver
export async function getEncuestaParaResolver(req, res) {
  try {
    const { codigo } = req.params;
    const id_usuario = req.user.id_usuario;

    // Verificar asignación
    const asignacion = await Asignacion.findOne({
      where: { id_usuario, codigo_formulario: codigo },
    });
    if (!asignacion) {
      return res.status(403).json({ error: "No tienes acceso a esta encuesta" });
    }

    const encuesta = await Formulario.findOne({
      where: { codigo, tipo: "Encuesta" },
      include: [
        {
          model: Seccion,
          as: "Secciones",
          include: [
            {
              model: Pregunta,
              as: "Preguntas",
              include: [{ model: Opcion, as: "Opciones" }],
            },
          ],
        },
      ],
      order: [
        [{ model: Seccion, as: "Secciones" }, "id_seccion", "ASC"],
        [
          { model: Seccion, as: "Secciones" },
          { model: Pregunta, as: "Preguntas" },
          "id_pregunta",
          "ASC",
        ],
      ],
    });

    if (!encuesta) {
      return res.status(404).json({ error: "Encuesta no encontrada" });
    }

    res.json(encuesta);
  } catch (err) {
    console.error("Error getEncuestaParaResolver:", err);
    res.status(500).json({ error: "Error interno" });
  }
}

// 🔹 POST guardar respuestas
export async function guardarRespuestasEncuesta(req, res) {
  try {
    const { codigo } = req.params;
    const id_usuario = req.user.id_usuario;
    const { finalizar, respuestas } = req.body;

    const asignacion = await Asignacion.findOne({
      where: { id_usuario, codigo_formulario: codigo },
    });
    if (!asignacion) {
      return res.status(403).json({ error: "No tienes asignación" });
    }

    // Guardar respuestas (upsert)
    for (const r of respuestas) {
      const valor =
        Array.isArray(r.valor) || typeof r.valor === "object"
          ? JSON.stringify(r.valor)
          : String(r.valor);

      const existente = await Respuesta.findOne({
        where: { id_asignacion: asignacion.id_asignacion, id_pregunta: r.id_pregunta },
      });

      if (existente) {
        await existente.update({ respuesta: valor });
      } else {
        await Respuesta.create({
          id_asignacion: asignacion.id_asignacion,
          id_pregunta: r.id_pregunta,
          respuesta: valor,
        });
      }
    }

    // Si finaliza → marcar asignación como completada
    if (finalizar) {
      await asignacion.update({
        estado: "completado",
        fecha_respuesta: new Date(),
      });
    } else {
      await asignacion.update({ estado: "en_progreso" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Error guardarRespuestasEncuesta:", err);
    res.status(500).json({ error: "Error interno" });
  }
}
