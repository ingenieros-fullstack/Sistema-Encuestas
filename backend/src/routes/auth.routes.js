import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// ======================================
// LOGIN
// ======================================
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    const user = await Usuario.findOne({ where: { correo_electronico: correo } });
    if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol, nombre: user.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, rol: user.rol, nombre: user.nombre });
  } catch (error) {
    res.status(500).json({ message: "Error en el login", error: error.message });
  }
});

// ======================================
// RUTA PROTEGIDA: Verificar token
// ======================================
router.get("/me", authMiddleware(), (req, res) => {
  res.json({
    id: req.user.id,
    rol: req.user.rol,
    nombre: req.user.nombre,
  });
});

// ======================================
// RUTA SOLO PARA ADMIN
// ======================================
router.get("/admin-only", authMiddleware(["admin"]), (req, res) => {
  res.json({
    message: "Bienvenido administrador 🚀",
    usuario: req.user,
  });
});

export default router;
