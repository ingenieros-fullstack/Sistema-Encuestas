import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "/src/App.css";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMensaje(data.message || "Error en login");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.rol || "");
      localStorage.setItem("nombre", data.nombre || "");

      let target = data.nextPath || "/";
      if (!data.nextPath) {
        switch (data.rol) {
          case "admin":
            target = "/admin/dashboard";
            break;
          case "empleado":
            target = "/empleado/dashboard";
            break;
          case "supervisor":
            target = "/supervisor/dashboard";
            break;
          default:
            target = "/";
        }
      }

      navigate(target, { replace: true });
    } catch (err) {
      setMensaje("Error de conexión con el backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      <div className="login-card">
        <img
          src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
          alt="Logo"
          className="logo-img"
        />
        <h2 className="login-title">Bienvenido al Sistema de Encuestas</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="form-control"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-control"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-login mt-3" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          {mensaje && (
            <div className="alert alert-danger">{mensaje}</div>
          )}
        </form>
      </div>
    </div>
  );
}