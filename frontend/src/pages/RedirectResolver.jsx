import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function RedirectResolver() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const rol = localStorage.getItem("rol");

  useEffect(() => {
    if (rol === "empleado") {
  navigate(`/empleado/encuestas/${codigo}`, { replace: true });
} else if (rol === "supervisor") {
  navigate(`/supervisor/encuestas/${codigo}`, { replace: true });
} else if (rol === "admin") {
  navigate(`/admin/encuestas/${codigo}/resolver`, { replace: true });
} else {
  navigate("/", { replace: true });
}

  }, [rol, codigo, navigate]);

  return (
    <div className="p-6 text-center text-gray-600">
      <p>Redirigiendo a la encuesta...</p>
    </div>
  );
}
