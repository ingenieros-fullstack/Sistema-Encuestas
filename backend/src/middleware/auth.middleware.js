import jwt from "jsonwebtoken";

export const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.status(401).json({ message: "Token requerido" });
      }

      // Esperamos formato "Bearer <token>"
      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ message: "Formato de token inválido" });
      }

      const token = parts[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 🔑 Estandarizamos para que siempre exista id_usuario
      req.user = {
        id_usuario: decoded.id_usuario,   // viene del token en login
        rol: decoded.rol,
        nombre: decoded.nombre,
        correo_electronico: decoded.correo_electronico || null
      };

      // Verificar roles si se pasó restricción
      if (roles.length > 0 && !roles.includes(req.user.rol)) {
        return res.status(403).json({ message: "Acceso denegado" });
      }

      next();
    } catch (error) {
      console.error("❌ Error en authMiddleware:", error.message);
      res.status(401).json({ message: "Token inválido o expirado" });
    }
  };
};
