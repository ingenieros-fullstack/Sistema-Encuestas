import Asignacion from "../models/Asignacion.js";
import Usuario from "../models/Usuario.js";
import Formulario from "../models/Formulario.js";

// POST /admin/asignaciones → crear asignaciones
export const crearAsignaciones = async (req, res) => {
  try {
    const { usuarios, formularios } = req.body;

    if (!usuarios?.length || !formularios?.length) {
      return res.status(400).json({ success: false, message: "Debe enviar usuarios y formularios" });
    }

    const asignaciones = [];

    for (const id_usuario of usuarios) {
      for (const codigo_formulario of formularios) {
        const [asignacion] = await Asignacion.findOrCreate({
          where: { id_usuario, codigo_formulario },
          defaults: { estado: "pendiente" },
        });
        asignaciones.push(asignacion);
      }
    }

    res.json({ success: true, asignaciones });
  } catch (err) {
    console.error("❌ Error en crearAsignaciones:", err);
    res.status(500).json({ success: false, message: "Error en servidor", error: err.message });
  }
};

// GET /admin/asignaciones → listar todas
export const listarAsignaciones = async (_req, res) => {
  try {
    const asignaciones = await Asignacion.findAll({
      include: [
        { model: Usuario, attributes: ["id_usuario", "correo_electronico"] },
        { model: Formulario, attributes: ["codigo", "titulo"] },
      ],
    });
    res.json({ success: true, asignaciones });
  } catch (err) {
    console.error("❌ Error en listarAsignaciones:", err);
    res.status(500).json({ success: false, message: "Error al obtener asignaciones" });
  }
};
// DELETE /admin/asignaciones/:id
export const eliminarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Asignacion.destroy({ where: { id_asignacion: id } });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Asignación no encontrada" });
    }

    res.json({ success: true, message: "Asignación eliminada" });
  } catch (err) {
    console.error("❌ Error en eliminarAsignacion:", err);
    res.status(500).json({ success: false, message: "Error al eliminar asignación" });
  }
};
