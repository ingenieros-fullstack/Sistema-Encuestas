// src/routes/usuarios.routes.js
import { Router } from "express";
import { body, validationResult } from "express-validator";
import {
  listarUsuarios,
  obtenerPorCorreo,
  actualizarUsuario,
  eliminarUsuario
} from "../controllers/usuarios.controller.js";

const router = Router();

// Middleware para manejar errores de validación
const validarCampos = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => e.msg)
    });
  }
  next();
};

// ✅ GET /usuarios → lista todos (usa ?q= para buscar)
router.get("/", async (req, res, next) => {
  try {
    await listarUsuarios(req, res);
  } catch (err) {
    next(err);
  }
});

// ✅ GET /usuarios/by-email?email=xxx → buscar por correo
router.get("/by-email", async (req, res, next) => {
  try {
    await obtenerPorCorreo(req, res);
  } catch (err) {
    next(err);
  }
});

// ✅ PUT /usuarios/update → actualizar rol y/o password
router.put(
  "/update",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").optional().isLength({ min: 6 }).withMessage("Mínimo 6 caracteres"),
    body("rol")
      .optional()
      .isIn(["admin", "supervisor", "empleado"])
      .withMessage("Rol inválido")
  ],
  validarCampos,
  async (req, res, next) => {
    try {
      await actualizarUsuario(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// ✅ DELETE /usuarios/:id → eliminar usuario
router.delete("/:id", async (req, res, next) => {
  try {
    await eliminarUsuario(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
