import Asignacion from "../models/Asignacion.js";
import Usuario from "../models/Usuario.js";
import DataEmpleado from "../models/DataEmpleado.js";
import Respuesta from "../models/Respuesta.js";
import Pregunta from "../models/Pregunta.js";
import Formulario from "../models/Formulario.js";

/**
 * Obtener respuestas por usuario o el resumen de todos los empleados de una encuesta
 */
export async function getRespuestasPorUsuario(req, res) {
  try {
    const { codigo } = req.params;
    const { usuario } = req.query;

    if (!codigo)
      return res.status(400).json({ error: "Falta el código del formulario" });

    // ======================================================
    // 🧩 Si no viene 'usuario' → devolvemos resumen general
    // ======================================================
    if (!usuario) {
      const asignaciones = await Asignacion.findAll({
        where: { codigo_formulario: codigo },
        include: [
          {
            model: Usuario,
            include: [{ model: DataEmpleado, as: "empleado" }],
          },
        ],
        order: [["id_asignacion", "ASC"]],
      });

      console.log("🔍 Asignaciones encontradas:", asignaciones.length);

      // Si no hay asignaciones
      if (!asignaciones || asignaciones.length === 0) {
        return res.json({
          codigo,
          empleados: [],
          mensaje: "No hay empleados asignados a esta encuesta",
        });
      }

      const data = asignaciones.map((a) => ({
        id_usuario: a.Usuario?.id_usuario,
        nombre: a.Usuario?.empleado?.nombre || "Desconocido",
        correo: a.Usuario?.correo_electronico,
        estado: a.estado,
        fecha_respuesta: a.fecha_respuesta,
      }));

      return res.json({ codigo, empleados: data });
    }

    // ======================================================
    // 🔹 Si se solicita el detalle de un usuario específico
    // ======================================================
    const asignacion = await Asignacion.findOne({
      where: { codigo_formulario: codigo, id_usuario: usuario },
      include: [
        {
          model: Usuario,
          include: [{ model: DataEmpleado, as: "empleado" }],
        },
        {
          model: Formulario,
          foreignKey: "codigo_formulario",
          targetKey: "codigo",
        },
      ],
    });

    if (!asignacion) {
      console.warn(
        `⚠️ No se encontró asignación para usuario ${usuario} en formulario ${codigo}`
      );
      return res
        .status(404)
        .json({ error: "No hay respuestas para este usuario" });
    }

    const respuestas = await Respuesta.findAll({
      where: { id_asignacion: asignacion.id_asignacion },
      include: [{ model: Pregunta }],
      order: [[{ model: Pregunta }, "id_pregunta", "ASC"]],
    });

    console.log(
      `📋 Respuestas encontradas para usuario ${usuario}:`,
      respuestas.length
    );

    const detalle = {
      empleado: {
        id_usuario: asignacion.Usuario.id_usuario,
        nombre: asignacion.Usuario.empleado?.nombre || "Desconocido",
        correo: asignacion.Usuario.correo_electronico,
      },
      formulario: {
        codigo,
        titulo: asignacion.Formulario?.titulo || "(sin título)",
        tipo: asignacion.Formulario?.tipo || "Encuesta",
      },
      respuestas: respuestas.map((r) => ({
        id_pregunta: r.id_pregunta,
        pregunta: r.Preguntum?.enunciado || "Pregunta eliminada",
        respuesta: parseRespuesta(r.respuesta),
      })),
    };

    res.json(detalle);
  } catch (err) {
    console.error("❌ Error getRespuestasPorUsuario:", err);
    res
      .status(500)
      .json({ error: "Error interno al obtener respuestas", detalle: err.message });
  }
}

/**
 * Helper para convertir respuestas JSON a texto legible
 */
function parseRespuesta(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(", ") : parsed;
  } catch {
    return value;
  }
}
