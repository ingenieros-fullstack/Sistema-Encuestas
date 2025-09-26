import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { importUsers, upload } from "../controllers/csvImport.controller.js";
import Usuario from "../models/Usuario.js";
import Empresa from "../models/Empresa.js";

const router = Router();

// Dashboard Admin
router.get("/dashboard", authMiddleware(["admin"]), (req, res) => {
  res.json({
    message: "Bienvenido al dashboard de ADMIN 🚀",
    usuario: req.user,
  });
});

router.post("/usuarios/import", 
  authMiddleware(["admin"]), 
  upload.single('file'), 
  importUsers
);

router.get("/usuarios", authMiddleware(["admin"]), async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json({ success: true, usuarios });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
});


// ======================================
// LOGIN con validación de must_change_password
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

    // Si el usuario debe cambiar la contraseña
    if (user.must_change_password === 1) {
      return res.status(403).json({
        success: false,
        mustChangePassword: true,
        message: "Debe cambiar su contraseña antes de continuar",
      });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol, correo: user.correo_electronico },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Redirección según rol
    let nextPath = "/dashboard";
    if (user.rol === "admin") nextPath = "/admin/dashboard";
    if (user.rol === "empleado") nextPath = "/empleado/dashboard";
    if (user.rol === "supervisor") nextPath = "/supervisor/dashboard";

    res.json({
      success: true,
      token,
      rol: user.rol,
      correo: user.correo_electronico,
      nextPath,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el login",
      error: error.message,
    });
  }
});

export default router;
