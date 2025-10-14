import Formulario from "../models/Formulario.js";
import Seccion from "../models/Seccion.js";
import Pregunta from "../models/Pregunta.js";
import Opcion from "../models/Opcion.js";

// ✅ Previsualizar encuesta completa
export const previsualizarEncuesta = async (req, res) => {
  try {
    const { codigo_formulario } = req.params;

    const encuesta = await Formulario.findOne({
      where: { codigo: codigo_formulario, tipo: "Encuesta" },
      include: [
        {
          model: Seccion,
          as: "Secciones", // 👈 alias igual que en los models
          include: [
            {
              model: Pregunta,
              as: "Preguntas", // 👈 alias igual que en los models
              include: [{ model: Opcion, as: "Opciones" }]
            }
          ]
        }
      ]
    });

    if (!encuesta) {
      return res.status(404).json({ error: "Encuesta no encontrada" });
    }

    res.json(encuesta);
  } catch (error) {
    console.error("❌ Error en previsualizarEncuesta:", error);
    res.status(500).json({ error: error.message });
  }
};
