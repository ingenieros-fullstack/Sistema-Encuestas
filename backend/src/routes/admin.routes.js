import { Router } from "express";  
import { authMiddleware } from "../middleware/auth.middleware.js";  
import { importUsers, upload } from "../controllers/csvImport.controller.js";  
import {  
  crearFormulario,  
  listarFormularios,  
  obtenerFormulario,  
  actualizarFormulario,  
  eliminarFormulario  
} from "../controllers/formulario.controller.js";  
import Usuario from "../models/Usuario.js";  
import Empresa from "../models/Empresa.js";  
import bcrypt from "bcryptjs";  
import jwt from "jsonwebtoken";  
  
const router = Router();  
  
// Dashboard Admin  
router.get("/dashboard", authMiddleware(["admin"]), (req, res) => {  
  res.json({  
    message: "Bienvenido al dashboard de ADMIN 🚀",  
    usuario: req.user,  
  });  
});  
  
// ===== RUTAS DE USUARIOS =====  
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
    res.status(500).json({   
      success: false,   
      message: 'Error al obtener usuarios',  
      error: error.message   
    });  
  }  
});  
  
// ===== RUTAS DE FORMULARIOS =====  
router.post("/formularios", authMiddleware(["admin"]), crearFormulario);  
router.get("/formularios", authMiddleware(["admin"]), listarFormularios);  
router.get("/formularios/:codigo", authMiddleware(["admin"]), obtenerFormulario);  
router.put("/formularios/:codigo", authMiddleware(["admin"]), actualizarFormulario);  
router.delete("/formularios/:codigo", authMiddleware(["admin"]), eliminarFormulario);  
  
// ===== LOGIN ENDPOINT =====  
router.post("/login", async (req, res) => {  
  try {  
    const { correo, password } = req.body;  
  
    if (!correo || !password) {  
      return res.status(400).json({  
        message: "Correo y contraseña son requeridos",  
      });  
    }  
  
    const user = await Usuario.findOne({  
      where: { correo_electronico: correo },  
    });  
  
    if (!user) {  
      return res.status(401).json({  
        message: "Usuario no encontrado",  
      });  
    }  
  
    const isValidPassword = await bcrypt.compare(password, user.password);  
    if (!isValidPassword) {  
      return res.status(401).json({  
        message: "Contraseña incorrecta",  
      });  
    }  
  
    if (user.must_change_password) {  
      return res.json({  
        mustChangePassword: true,  
        message: "Debe cambiar su contraseña antes de continuar",  
      });  
    }  
  
    const token = jwt.sign(  
      { id: user.id_usuario, rol: user.rol, correo: user.correo_electronico },  
      process.env.JWT_SECRET,  
      { expiresIn: "8h" }  
    );  
  
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