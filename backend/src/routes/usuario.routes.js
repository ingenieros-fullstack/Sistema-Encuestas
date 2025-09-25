import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/usuario/dashboard", authMiddleware(["usuario"]), (req, res) => {
  res.json({
    message: "Bienvenido al Dashboard Usuario 👤",
    user: req.user,
  });
});

export default router;