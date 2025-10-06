// src/controllers/usuarios.controller.js
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import Usuario from "../models/Usuario.js";
import DataEmpleado from "../models/DataEmpleado.js";

const ALLOWED_ROLES = ["admin", "supervisor", "empleado"];
// ======================================================
// 🔹 Listar solo correo, rol y acciones
// ======================================================
export async function listarUsuarios(req, res) {
  try {
    const q = (req.query.q || "").trim().toLowerCase();

    // Solo traemos lo necesario
    const usuarios = await Usuario.findAll({
      attributes: ["id_usuario", "correo_electronico", "rol"],
      order: [["id_usuario", "ASC"]],
      raw: true,
    });

    const salida = usuarios
      .filter(
        (u) =>
          !q ||
          u.correo_electronico.toLowerCase().includes(q) ||
          u.rol.toLowerCase().includes(q)
      )
      .map((u) => ({
        id_usuario: u.id_usuario,
        correo_electronico: u.correo_electronico,
        rol: u.rol,
      }));

    res.json({ success: true, usuarios: salida });
  } catch (err) {
    console.error("❌ Error listarUsuarios:", err);
    res.status(500).json({
      error: "Error al listar usuarios",
      detail: err.message,
    });
  }
}

// Buscar un usuario por correo
export async function obtenerPorCorreo(req, res) {
  try {
    const email = (req.query.email || "").trim();
    if (!email) return res.status(400).json({ error: "email requerido" });

    const usuario = await Usuario.findOne({
      where: { correo_electronico: email },
      include: [{ model: DataEmpleado, as: "empleado", attributes: ["nombre"] }],
      attributes: ["id_usuario", "correo_electronico", "rol"]
    });

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({
      id: usuario.id_usuario,
      correo: usuario.correo_electronico,
      rol: usuario.rol,
      nombre: usuario.empleado?.nombre || ""
    });
  } catch (err) {
    res.status(500).json({ error: "Error al buscar usuario", detail: err.message });
  }
}

// Actualizar rol y/o contraseña
export async function actualizarUsuario(req, res) {
  try {
    const { email, rol, password } = req.body;

    if (!email) return res.status(400).json({ error: "email requerido" });

    const usuario = await Usuario.findOne({ where: { correo_electronico: email } });
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    // Rol
    if (rol) {
      if (!ALLOWED_ROLES.includes(rol)) {
        return res.status(400).json({ error: "rol inválido" });
      }
      usuario.rol = rol;
    }

    // Contraseña
    if (password && password.length >= 6) {
      const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
      const hash = await bcrypt.hash(password, rounds);
      usuario.password = hash;
      usuario.must_change_password = 0; // o 1 si quieres obligar a cambio
    }

    await usuario.save();
    res.json({ ok: true, message: "Usuario actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar usuario", detail: err.message });
  }
}

// Eliminar usuario
export async function eliminarUsuario(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Usuario.destroy({ where: { id_usuario: id } });
    if (!deleted) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar", detail: err.message });
  }
}
