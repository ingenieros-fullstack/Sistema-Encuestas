// backend/src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";

// Middleware de autenticación con soporte de roles
export const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    console.log("🧩 Entrando a authMiddleware...");

    try {
      const authHeader = req.headers["authorization"];
      console.log("🔍 Cabecera Authorization recibida:", authHeader || "(vacía)");

      if (!authHeader) {
        console.warn("⚠️ No se envió token en la cabecera Authorization");
        return res.status(401).json({ message: "Token requerido" });
      }

      // Esperamos formato "Bearer <token>"
      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        console.warn("⚠️ Formato incorrecto de token:", parts);
        return res.status(401).json({ message: "Formato de token inválido" });
      }

      const token = parts[1];
      console.log("🪶 Token recibido:", token.substring(0, 15) + "...");

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecreto123");
      console.log("✅ Token verificado correctamente:", {
        id_usuario: decoded.id_usuario,
        rol: decoded.rol,
        nombre: decoded.nombre,
      });

      // Estandarizamos datos del usuario autenticado
      req.user = {
        id_usuario: decoded.id_usuario,
        rol: decoded.rol,
        nombre: decoded.nombre,
        correo_electronico: decoded.correo_electronico || null,
      };

      // Si se pasaron roles permitidos, verificar
      if (roles.length > 0 && !roles.includes(req.user.rol)) {
        console.warn(`🚫 Acceso denegado: Rol '${req.user.rol}' no permitido. Roles requeridos:`, roles);
        return res.status(403).json({ message: "Acceso denegado" });
      }

      console.log("➡️ Paso authMiddleware completado. Continuando con la ruta...");
      next();

    } catch (error) {
      console.error("❌ Error en authMiddleware:", error.message);
      res.status(401).json({ message: "Token inválido o expirado" });
    }
  };
};
