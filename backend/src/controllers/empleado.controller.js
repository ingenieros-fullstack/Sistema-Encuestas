import Asignacion from "../models/Asignacion.js";
import Formulario from "../models/Formulario.js";

// 📋 Listar formularios asignados a un empleado
export const listarAsignacionesEmpleado = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario; // tomado del token

    const asignaciones = await Asignacion.findAll({
      where: { id_usuario },
      include: [
        {
          model: Formulario,
          attributes: [
            "codigo",
            "titulo",
            "descripcion",
            "tipo",
            "estatus",
            "tiempo_limite",
            "fecha_inicio",
            "fecha_fin"
          ],
        },
      ],
      order: [["fecha_asignacion", "DESC"]],
    });

    res.json(asignaciones);
  } catch (error) {
    console.error("❌ Error al listar asignaciones empleado:", error);
    res.status(500).json({ message: "Error al obtener asignaciones" });
  }
};
