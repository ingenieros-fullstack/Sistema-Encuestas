// src/routes/usuarios.routes.js
import { Router } from "express";
import { body } from "express-validator";
import {
  listarUsuarios,
  obtenerPorCorreo,
  actualizarUsuario,
  eliminarUsuario
} from "../controllers/usuarios.controller.js";

const router = Router();

// GET /usuarios -> lista todos
router.get("/", listarUsuarios);

// GET /usuarios/by-email?email=xxx -> buscar por correo
router.get("/by-email", obtenerPorCorreo);

// PUT /usuarios/update -> actualizar rol y/o password
router.put(
  "/update",
  [
    body("email").isEmail().withMessage("email inválido"),
    body("password").optional().isLength({ min: 6 }).withMessage("min 6 caracteres"),
    body("rol").optional().isIn(["admin", "supervisor", "empleado"]).withMessage("rol inválido")
  ],
  actualizarUsuario
);

// DELETE /usuarios/:id -> eliminar usuario
router.delete("/:id", eliminarUsuario);

export default router;
