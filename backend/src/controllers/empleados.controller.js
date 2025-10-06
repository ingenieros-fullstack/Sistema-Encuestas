// src/controllers/empleados.controller.js
import DataEmpleado from "../models/DataEmpleado.js";

/**
 * ======================================================
 * 🔹 Listar todos los empleados registrados
 * ======================================================
 * Endpoint: GET /admin/empleados
 * Retorna todos los registros de la tabla data_empleados
 */
export async function listarEmpleados(req, res) {
  try {
    const empleados = await DataEmpleado.findAll({
      attributes: [
        "id_data",
        "numero_empleado",
        "nombre",
        "correo_electronico",
        "centro_trabajo",
        "departamento",
        "supervisor",
      ],
      order: [["id_data", "ASC"]],
    });

    return res.json({
      success: true,
      total: empleados.length,
      empleados,
    });
  } catch (err) {
    console.error("❌ Error listarEmpleados:", err);
    return res.status(500).json({
      success: false,
      message: "Error al listar empleados",
      error: err.message,
    });
  }
}
