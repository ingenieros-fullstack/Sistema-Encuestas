import Pregunta from "../models/Pregunta.js";
import Seccion from "../models/Seccion.js";
import Formulario from "../models/Formulario.js";
import Opcion from "../models/Opcion.js";

// ✅ Crear pregunta en una sección de Encuesta
export const crearPreguntaEncuesta = async (req, res) => {
  try {
    const { id_seccion } = req.params;
    const { enunciado, tipo_pregunta, obligatoria, opciones = [] } = req.body;

    // Verificar que la sección pertenezca a un formulario tipo Encuesta
    const seccion = await Seccion.findByPk(id_seccion, {
      include: [{ model: Formulario, as: "Formulario" }]
    });

    if (!seccion || !seccion.Formulario || seccion.Formulario.tipo !== "Encuesta") {
      return res
        .status(404)
        .json({ error: "Sección no encontrada o no pertenece a una Encuesta" });
    }

    // Crear la pregunta
    const pregunta = await Pregunta.create({
      id_seccion,
      enunciado,
      tipo_pregunta,
      obligatoria
    });

    // Si vienen opciones y el tipo lo requiere → crear opciones
    if (
      (tipo_pregunta === "opcion_multiple" || tipo_pregunta === "seleccion_unica") &&
      Array.isArray(opciones) &&
      opciones.length > 0
    ) {
      const opcionesData = opciones.map((op) => ({
        id_pregunta: pregunta.id_pregunta,
        texto: typeof op === "string" ? op : op.texto,
        valor: typeof op === "string" ? op : op.valor
      }));
      await Opcion.bulkCreate(opcionesData);
    }

    // Retornar la pregunta con sus opciones incluidas
    const preguntaCompleta = await Pregunta.findByPk(pregunta.id_pregunta, {
      include: [{ model: Opcion, as: "Opciones" }]
    });

    res.status(201).json(preguntaCompleta);
  } catch (error) {
    console.error("❌ Error en crearPreguntaEncuesta:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Listar preguntas de una sección de Encuesta
export const listarPreguntasEncuesta = async (req, res) => {
  try {
    const { id_seccion } = req.params;

    const seccion = await Seccion.findByPk(id_seccion, {
      include: [{ model: Formulario, as: "Formulario" }]
    });

    if (!seccion || !seccion.Formulario || seccion.Formulario.tipo !== "Encuesta") {
      return res
        .status(404)
        .json({ error: "Sección no encontrada o no pertenece a una Encuesta" });
    }

    const preguntas = await Pregunta.findAll({
      where: { id_seccion },
      include: [{ model: Opcion, as: "Opciones" }]
    });

    res.json(preguntas);
  } catch (error) {
    console.error("❌ Error en listarPreguntasEncuesta:", error);
    res.status(500).json({ error: error.message });
  }
};
