import Pregunta from "../models/Pregunta.js";
import Opcion from "../models/Opcion.js";

/** ================== CREAR PREGUNTA ================== */
export const crearPregunta = async (req, res) => {
  try {
    const {
      id_seccion,
      enunciado,
      tipo_pregunta,
      obligatoria,
      respuesta_correcta,
      puntaje,
      opciones,
    } = req.body;

    // Crear la pregunta base
    const pregunta = await Pregunta.create({
      id_seccion,
      enunciado,
      tipo_pregunta,
      obligatoria,
      respuesta_correcta,
      puntaje,
    });

    // Si hay opciones, guardarlas
    if (opciones && Array.isArray(opciones) && opciones.length > 0) {
      const opcionesRows = opciones.map((texto) => ({
        id_pregunta: pregunta.id_pregunta,
        texto,
      }));
      await Opcion.bulkCreate(opcionesRows);
    }

    res.json({ pregunta });
  } catch (err) {
    console.error("❌ Error crearPregunta:", err);
    res.status(500).json({ error: err.message });
  }
};

/** ================== ACTUALIZAR PREGUNTA ================== */
export const actualizarPregunta = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      enunciado,
      tipo_pregunta,
      obligatoria,
      puntaje,
      respuesta_correcta,
      opciones,
    } = req.body;

    const pregunta = await Pregunta.findByPk(id);
    if (!pregunta) return res.status(404).json({ error: "Pregunta no encontrada" });

    // Actualizar campos principales
    pregunta.enunciado = enunciado ?? pregunta.enunciado;
    pregunta.tipo_pregunta = tipo_pregunta ?? pregunta.tipo_pregunta;
    pregunta.obligatoria = obligatoria ?? pregunta.obligatoria;
    pregunta.puntaje = puntaje ?? pregunta.puntaje;
    pregunta.respuesta_correcta = respuesta_correcta ?? pregunta.respuesta_correcta;

    await pregunta.save();

    // Actualizar opciones si aplica
    if (Array.isArray(opciones)) {
      // Primero eliminamos las opciones viejas
      await Opcion.destroy({ where: { id_pregunta: pregunta.id_pregunta } });

      // Insertamos las nuevas
      if (opciones.length > 0) {
        const opcionesRows = opciones.map((texto) => ({
          id_pregunta: pregunta.id_pregunta,
          texto,
        }));
        await Opcion.bulkCreate(opcionesRows);
      }
    }

    return res.json({ message: "Pregunta actualizada", pregunta });
  } catch (err) {
    console.error("❌ Error actualizarPregunta:", err);
    return res.status(500).json({ error: err.message });
  }
};

/** ================== ELIMINAR PREGUNTA ================== */
export const eliminarPregunta = async (req, res) => {
  try {
    const { id } = req.params;
    const pregunta = await Pregunta.findByPk(id);
    if (!pregunta) return res.status(404).json({ error: "Pregunta no encontrada" });

    await pregunta.destroy();
    res.json({ message: "Pregunta eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
