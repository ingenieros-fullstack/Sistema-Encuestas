import Seccion from "../models/Seccion.js";
import Formulario from "../models/Formulario.js";
import Pregunta from "../models/Pregunta.js";
import Opcion from "../models/Opcion.js";

// ==========================================================
// 🔹 Crear sección en una Encuesta (soporta condicional)
// ==========================================================
export const crearSeccionEncuesta = async (req, res) => {
  try {
    const { codigo_formulario } = req.params;
    const { tema, nombre_seccion, condicion_pregunta_id, condicion_valor } = req.body;

    // Verificar que el formulario exista y sea tipo Encuesta
    const formulario = await Formulario.findOne({
      where: { codigo: codigo_formulario, tipo: "Encuesta" },
    });

    if (!formulario) {
      return res
        .status(404)
        .json({ error: "Formulario de tipo Encuesta no encontrado" });
    }

    // Crear sección (puede incluir condición)
    const seccion = await Seccion.create({
      codigo_formulario,
      tema,
      nombre_seccion,
      condicion_pregunta_id: condicion_pregunta_id || null,
      condicion_valor: condicion_valor || null,
    });

    res.status(201).json(seccion);
  } catch (error) {
    console.error("❌ Error en crearSeccionEncuesta:", error);
    res.status(500).json({ error: "Error al crear sección" });
  }
};
// ==========================================================
// 🔹 Listar secciones con preguntas y opciones (debug completo)
// ==========================================================
export const listarSeccionesEncuesta = async (req, res) => {
  console.log("➡️ Ejecutando listarSeccionesEncuesta()...");

  try {
    const { codigo_formulario } = req.params;
    console.log("📥 Código recibido:", codigo_formulario);

    const formulario = await Formulario.findOne({
      where: { codigo: codigo_formulario, tipo: "Encuesta" },
    });

    if (!formulario) {
      console.warn("⚠️ Formulario no encontrado o no es tipo Encuesta");
      return res
        .status(404)
        .json({ error: "Formulario de tipo Encuesta no encontrado" });
    }

    console.log("✅ Formulario encontrado. Cargando secciones...");

    const secciones = await Seccion.findAll({
      where: { codigo_formulario },
      include: [
        {
          model: Pregunta,
          as: "Preguntas",
          include: [{ model: Opcion, as: "Opciones" }],
        },
        {
          model: Pregunta,
          as: "CondicionPregunta",
          attributes: ["id_pregunta", "enunciado", "tipo_pregunta"],
        },
      ],
      order: [["id_seccion", "ASC"]],
    });

    console.log(`✅ Secciones encontradas: ${secciones.length}`);
    console.log("📦 Ejemplo de sección:", secciones[0] || "—");

    res.json(secciones);

  } catch (error) {
    console.error("❌ Error en listarSeccionesEncuesta:", error);
    res.status(500).json({ error: error.message });
  }
};


// ==========================================================
// 🔹 Actualizar sección (nombre, tema, condición)
// ==========================================================
export const actualizarSeccionEncuesta = async (req, res) => {
  try {
    const { id_seccion } = req.params;
    const { nombre_seccion, tema, condicion_pregunta_id, condicion_valor } = req.body;

    const seccion = await Seccion.findByPk(id_seccion);
    if (!seccion)
      return res.status(404).json({ error: "Sección no encontrada" });

    await seccion.update({
      nombre_seccion,
      tema,
      condicion_pregunta_id: condicion_pregunta_id || null,
      condicion_valor: condicion_valor || null,
    });

    res.json(seccion);
  } catch (error) {
    console.error("❌ Error en actualizarSeccionEncuesta:", error);
    res.status(500).json({ error: "Error al actualizar sección" });
  }
};

// ==========================================================
// 🔹 Eliminar sección
// ==========================================================
export const eliminarSeccionEncuesta = async (req, res) => {
  try {
    const { id_seccion } = req.params;
    const seccion = await Seccion.findByPk(id_seccion);
    if (!seccion)
      return res.status(404).json({ error: "Sección no encontrada" });

    await seccion.destroy();
    res.json({ message: "Sección eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error en eliminarSeccionEncuesta:", error);
    res.status(500).json({ error: "Error al eliminar sección" });
  }
};
