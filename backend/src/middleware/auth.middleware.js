import jwt from "jsonwebtoken";

export const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) return res.status(401).json({ message: "Token requerido" });

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (roles.length && !roles.includes(decoded.rol)) {
        return res.status(403).json({ message: "Acceso denegado" });
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Token inválido" });
    }
  };
};
