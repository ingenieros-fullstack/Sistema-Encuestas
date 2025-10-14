import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import DataEmpleado from "../models/DataEmpleado.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * ======================================================
 * 🔐 LOGIN — Acepta correo o número de empleado
 * ======================================================
 * Permite autenticarse usando:
 *   - correo_electronico
 *   - numero_empleado
 */
router.post("/login", async (req, res) => {
  try {
    const { correo, numero_empleado, password } = req.body;

    if ((!correo && !numero_empleado) || !password) {
      return res.status(400).json({
        message: "Debe ingresar correo o número de empleado y la contraseña.",
      });
    }

    // ======================================================
    // 1️⃣ Buscar usuario por correo o número_empleado
    // ======================================================
    let user;

    if (correo) {
      user = await Usuario.findOne({
        where: { correo_electronico: correo.trim().toLowerCase() },
        include: [{ model: DataEmpleado, as: "empleado" }],
      });
    } else if (numero_empleado) {
      user = await Usuario.findOne({
        where: { numero_empleado: numero_empleado.trim() },
        include: [{ model: DataEmpleado, as: "empleado" }],
      });
    }

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // ======================================================
    // 2️⃣ Verificar contraseña
    // ======================================================
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    if (user.estatus === 0) {
      return res.status(403).json({ message: "Usuario inactivo" });
    }

    // ======================================================
    // 3️⃣ Generar token JWT
    // ======================================================
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        rol: user.rol,
        numero_empleado: user.numero_empleado,
        correo_electronico: user.correo_electronico,
        nombre: user.empleado?.nombre || "(sin nombre)",
      },
      process.env.JWT_SECRET || "supersecreto123",
      { expiresIn: "8h" }
    );

    // ======================================================
    // 4️⃣ Determinar redirección según rol
    // ======================================================
    let nextPath = "/";
    switch (user.rol) {
      case "admin":
        nextPath = "/admin/dashboard";
        break;
      case "empleado":
        nextPath = "/empleado/dashboard";
        break;
      case "supervisor":
        nextPath = "/supervisor/dashboard";
        break;
    }

    // ======================================================
    // 5️⃣ Responder al cliente
    // ======================================================
    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      rol: user.rol,
      nombre: user.empleado?.nombre || "(sin nombre)",
      numero_empleado: user.numero_empleado,
      correo_electronico: user.correo_electronico,
      mustChangePassword: user.must_change_password,
      nextPath,
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({
      message: "Error en el login",
      error: error.message,
    });
  }
});

/**
 * ======================================================
 * 🔄 Cambiar contraseña obligatoria
 * ======================================================
 */
router.post("/change-password", authMiddleware(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id_usuario;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Debe ingresar ambas contraseñas" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    const user = await Usuario.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña actual incorrecta" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
      password: hashedNewPassword,
      must_change_password: false,
    });

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("❌ Error al cambiar contraseña:", error);
    res.status(500).json({
      message: "Error al cambiar contraseña",
      error: error.message,
    });
  }
});

/**
 * ======================================================
 * 👤 Obtener información del usuario autenticado
 * ======================================================
 */
router.get("/me", authMiddleware(), (req, res) => {
  res.json({
    id_usuario: req.user.id_usuario,
    rol: req.user.rol,
    numero_empleado: req.user.numero_empleado,
    correo_electronico: req.user.correo_electronico,
    nombre: req.user.nombre,
  });
});

export default router;
