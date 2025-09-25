import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// ======================================
// LOGIN con redirección según rol
// ======================================
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    const user = await Usuario.findOne({
      where: { correo_electronico: correo },
    });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol, nombre: user.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Redirección según rol
    let nextPath = "/dashboard";
    if (user.rol === "admin") nextPath = "/admin/dashboard";
    if (user.rol === "empleado") nextPath = "/empleado/dashboard";
    if (user.rol === "supervisor") nextPath = "/supervisor/dashboard";

    res.json({
      token,
      rol: user.rol,
      nombre: user.nombre,
      nextPath,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el login",
      error: error.message,
    });
  }
});

// ======================================
// Verificar token y devolver usuario
// ======================================
router.get("/me", authMiddleware(), (req, res) => {
  res.json({
    id: req.user.id,
    rol: req.user.rol,
    nombre: req.user.nombre,
  });
});

export default router;
