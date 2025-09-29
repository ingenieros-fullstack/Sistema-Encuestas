import Seccion from "../models/Seccion.js";
import Formulario from "../models/Formulario.js";
import Pregunta from "../models/Pregunta.js";
import Opcion from "../models/Opcion.js";

// ✅ Crear sección en una Encuesta
export const crearSeccionEncuesta = async (req, res) => {
  try {
    const { codigo_formulario } = req.params;
    const { tema, nombre_seccion } = req.body;

    // Verificar que el formulario exista y sea tipo Encuesta
    const formulario = await Formulario.findOne({
      where: { codigo: codigo_formulario, tipo: "Encuesta" }
    });

    if (!formulario) {
      return res
        .status(404)
        .json({ error: "Formulario de tipo Encuesta no encontrado" });
    }

    const seccion = await Seccion.create({
      codigo_formulario,
      tema,
      nombre_seccion
    });

    res.status(201).json(seccion);
  } catch (error) {
    console.error("❌ Error en crearSeccionEncuesta:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Listar secciones con preguntas (incluye opciones)
export const listarSeccionesEncuesta = async (req, res) => {
  try {
    const { codigo_formulario } = req.params;

    const formulario = await Formulario.findOne({
      where: { codigo: codigo_formulario, tipo: "Encuesta" }
    });

    if (!formulario) {
      return res
        .status(404)
        .json({ error: "Formulario de tipo Encuesta no encontrado" });
    }

    const secciones = await Seccion.findAll({
      where: { codigo_formulario },
      include: [
        {
          model: Pregunta,
          as: "Preguntas",
          include: [{ model: Opcion, as: "Opciones" }]
        }
      ]
    });

    res.json(secciones);
  } catch (error) {
    console.error("❌ Error en listarSeccionesEncuesta:", error);
    res.status(500).json({ error: error.message });
  }
};
