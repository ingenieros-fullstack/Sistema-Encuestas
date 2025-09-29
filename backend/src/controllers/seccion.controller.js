import Seccion from "../models/Seccion.js";

export const crearSeccion = async (req, res) => {
  try {
    const { codigo_formulario, nombre_seccion } = req.body;
    const seccion = await Seccion.create({ codigo_formulario, nombre_seccion });
    res.json({ seccion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Editar sección
export const actualizarSeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_seccion, tema } = req.body;

    const seccion = await Seccion.findByPk(id);
    if (!seccion) return res.status(404).json({ error: "Sección no encontrada" });

    seccion.nombre_seccion = nombre_seccion || seccion.nombre_seccion;
    seccion.tema = tema || seccion.tema;
    await seccion.save();

    res.json({ message: "Sección actualizada", seccion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Eliminar sección
export const eliminarSeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const seccion = await Seccion.findByPk(id);
    if (!seccion) return res.status(404).json({ error: "Sección no encontrada" });

    await seccion.destroy();
    res.json({ message: "Sección eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
