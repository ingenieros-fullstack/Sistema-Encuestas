// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles definidos, validar
  if (roles && !roles.includes(rol)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
