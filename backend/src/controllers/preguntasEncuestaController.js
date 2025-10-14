import Pregunta from "../models/Pregunta.js";
import Seccion from "../models/Seccion.js";
import Formulario from "../models/Formulario.js";
import Opcion from "../models/Opcion.js";
import sequelize from "../config/db.js"; // ✅ asegúrate que existe

// ==========================================================
// ✅ Crear pregunta en una sección de Encuesta
// ==========================================================
export const crearPreguntaEncuesta = async (req, res) => {
  try {
    const { id_seccion } = req.params;
    const { enunciado, tipo_pregunta, obligatoria, opciones = [] } = req.body;

    const seccion = await Seccion.findByPk(id_seccion, {
      include: [{ model: Formulario, as: "Formulario" }],
    });

    if (!seccion || !seccion.Formulario || seccion.Formulario.tipo !== "Encuesta") {
      return res
        .status(404)
        .json({ error: "Sección no encontrada o no pertenece a una Encuesta" });
    }

    const pregunta = await Pregunta.create({
      id_seccion,
      enunciado,
      tipo_pregunta,
      obligatoria,
    });

    // ✅ Crear opciones si aplica
    if (
      ["opcion_multiple", "seleccion_unica"].includes(tipo_pregunta) &&
      Array.isArray(opciones) &&
      opciones.length > 0
    ) {
      const opcionesData = opciones.map((op) => ({
        id_pregunta: pregunta.id_pregunta,
        texto: typeof op === "string" ? op : op.texto,
        valor: typeof op === "string" ? op : op.valor,
      }));
      await Opcion.bulkCreate(opcionesData);
    }

    const preguntaCompleta = await Pregunta.findByPk(pregunta.id_pregunta, {
      include: [{ model: Opcion, as: "Opciones" }],
    });

    res.status(201).json(preguntaCompleta);
  } catch (error) {
    console.error("❌ Error en crearPreguntaEncuesta:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==========================================================
// ✅ Actualizar pregunta (Encuesta)
// ==========================================================
export const actualizarPreguntaEncuesta = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_pregunta } = req.params;
    const { enunciado, tipo_pregunta, obligatoria, opciones = [] } = req.body;

    console.log("🧩 Actualizando pregunta:", id_pregunta, req.body);

    const pregunta = await Pregunta.findByPk(id_pregunta, { transaction });
    if (!pregunta) {
      await transaction.rollback();
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }

    // ✅ Verificar que pertenece a una encuesta
    const seccion = await Seccion.findByPk(pregunta.id_seccion, {
      include: [{ model: Formulario, as: "Formulario" }],
      transaction,
    });

    if (!seccion || seccion.Formulario.tipo !== "Encuesta") {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "La sección no pertenece a una encuesta" });
    }

    // ✅ Actualizar campos base
    await pregunta.update(
      { enunciado, tipo_pregunta, obligatoria },
      { transaction }
    );

    // ✅ Manejar opciones según tipo
    await Opcion.destroy({ where: { id_pregunta }, transaction });

    if (
      ["opcion_multiple", "seleccion_unica"].includes(tipo_pregunta) &&
      Array.isArray(opciones) &&
      opciones.length > 0
    ) {
      const nuevasOpciones = opciones.map((txt) => ({
        id_pregunta,
        texto: typeof txt === "string" ? txt : txt.texto,
        valor: typeof txt === "string" ? txt : txt.valor,
      }));
      await Opcion.bulkCreate(nuevasOpciones, { transaction });
    }

    await transaction.commit();

    const actualizada = await Pregunta.findByPk(id_pregunta, {
      include: [{ model: Opcion, as: "Opciones" }],
    });

    console.log("✅ Pregunta actualizada correctamente:", actualizada.id_pregunta);
    res.json(actualizada);
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error en actualizarPreguntaEncuesta:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==========================================================
// ✅ Listar preguntas de una sección de Encuesta
// ==========================================================
export const listarPreguntasEncuesta = async (req, res) => {
  try {
    const { id_seccion } = req.params;

    const seccion = await Seccion.findByPk(id_seccion, {
      include: [{ model: Formulario, as: "Formulario" }],
    });

    if (!seccion || !seccion.Formulario || seccion.Formulario.tipo !== "Encuesta") {
      return res
        .status(404)
        .json({ error: "Sección no encontrada o no pertenece a una Encuesta" });
    }

    const preguntas = await Pregunta.findAll({
      where: { id_seccion },
      include: [{ model: Opcion, as: "Opciones" }],
    });

    res.json(preguntas);
  } catch (error) {
    console.error("❌ Error en listarPreguntasEncuesta:", error);
    res.status(500).json({ error: error.message });
  }
};
// ✅ Eliminar pregunta
export const eliminarPreguntaEncuesta = async (req, res) => {
  try {
    const { id_pregunta } = req.params;

    const pregunta = await Pregunta.findByPk(id_pregunta);
    if (!pregunta) return res.status(404).json({ error: "Pregunta no encontrada" });

    // Primero eliminar opciones asociadas
    await Opcion.destroy({ where: { id_pregunta } });

    // Luego eliminar la pregunta
    await Pregunta.destroy({ where: { id_pregunta } });

    console.log(`🗑️ Pregunta ${id_pregunta} eliminada correctamente`);
    res.json({ message: "Pregunta eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error en eliminarPreguntaEncuesta:", error);
    res.status(500).json({ error: error.message });
  }
};