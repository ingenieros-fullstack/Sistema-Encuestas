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
  {
    id_usuario: user.id_usuario,   // ✅ ahora es consistente
    rol: user.rol,
    nombre: user.nombre,
    correo_electronico: user.correo_electronico
  },
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
      mustChangePassword: user.must_change_password  // NUEVO CAMPO  
    });  
  } catch (error) {  
    res.status(500).json({  
      message: "Error en el login",  
      error: error.message,  
    });  
  }  
});  
  
// ======================================  
// NUEVO: Cambiar contraseña obligatoria  
// ======================================  
router.post("/change-password", authMiddleware(), async (req, res) => {  
  try {  
    const { currentPassword, newPassword } = req.body;  
    const userId = req.user.id;  
  
    // Validaciones básicas  
    if (!currentPassword || !newPassword) {  
      return res.status(400).json({   
        message: "Contraseña actual y nueva contraseña son requeridas"   
      });  
    }  
  
    if (newPassword.length < 6) {  
      return res.status(400).json({   
        message: "La nueva contraseña debe tener al menos 6 caracteres"   
      });  
    }  
  
    const user = await Usuario.findByPk(userId);  
    if (!user) {  
      return res.status(404).json({ message: "Usuario no encontrado" });  
    }  
  
    // Verificar contraseña actual  
    const isMatch = await bcrypt.compare(currentPassword, user.password);  
    if (!isMatch) {  
      return res.status(400).json({ message: "Contraseña actual incorrecta" });  
    }  
  
    // Hashear nueva contraseña  
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);  
  
    // Actualizar contraseña y quitar flag  
    await user.update({  
      password: hashedNewPassword,  
      must_change_password: false  
    });  
  
    res.json({ message: "Contraseña actualizada exitosamente" });  
  } catch (error) {  
    res.status(500).json({  
      message: "Error al cambiar contraseña",  
      error: error.message  
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