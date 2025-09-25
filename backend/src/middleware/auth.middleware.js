import jwt from "jsonwebtoken";

export const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.status(401).json({ message: "Token requerido" });
      }

      // Verifica que venga con formato "Bearer <token>"
      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ message: "Formato de token inválido" });
      }

      const token = parts[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verifica roles si se pasaron al middleware
      if (roles.length && !roles.includes(decoded.rol)) {
        return res.status(403).json({ message: "Acceso denegado" });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error("❌ Error en authMiddleware:", error.message);
      res.status(401).json({ message: "Token inválido" });
    }
  };
};
