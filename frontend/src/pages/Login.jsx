import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/src/images/VelCodelogoOficial.png"; // ✅ tu logo
import "/src/login.css";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // === Tema (light/dark) con persistencia ===
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    try {
     // URL base dinámica: local o producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const res = await fetch(`${API_URL}/auth/login`, {
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
      localStorage.setItem("mustChangePassword", data.mustChangePassword || "false");

      if (data.mustChangePassword && (data.rol === "empleado" || data.rol === "supervisor")) {
        navigate("/change-password", { replace: true });
        return;
      }

      let target = data.nextPath || "/";
      if (!data.nextPath) {
        switch (data.rol) {
          case "admin": target = "/admin/dashboard"; break;
          case "empleado": target = "/empleado/dashboard"; break;
          case "supervisor": target = "/supervisor/dashboard"; break;
          default: target = "/";
        }
      }
      navigate(target, { replace: true });
    } catch {
      setMensaje("Error de conexión con el backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth auth--v2">
      {/* decoraciones */}
      <div className="aurora" />
      <div className="stars" />

      {/* Toggle de tema */}
      <button
        className="theme-toggle"
        type="button"
        aria-label="Cambiar tema"
        onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      >
        <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"}`} />
      </button>

      <div className="auth__surface">
        {/* HERO IZQUIERDO */}
        <aside className="auth__aside">
          <div className="auth__brand">
            {/* ✅ Logo Reemplazando el cuadro (sin fondo extra) */}
            <img src={logo} alt="VelCode" className="auth__logo-img" />
            <h1>Sistema de Encuestas</h1>
            <p>Diseña, gestiona y analiza encuestas con estilo moderno.</p>
          </div>

          <ul className="auth__bullets">
            <li><i className="bi bi-shield-check" /> Seguridad y confiabilidad</li>
            <li><i className="bi bi-speedometer2" /> Paneles ágiles y claros</li>
            <li><i className="bi bi-bar-chart-line" /> Reportes y métricas</li>
          </ul>

          <div className="auth__shape" aria-hidden />
        </aside>

        {/* PANEL DERECHO */}
        <main className="auth__panel">
          <div className="auth-card auth-card--border">
            <div className="auth-card__head">
              <span className="auth-card__badge"><i className="bi bi-shield-lock" /> Acceso</span>
              <h2>Iniciar sesión</h2>
              <p className="muted">Bienvenido de nuevo. Ingresa tus credenciales.</p>
            </div>

            <form className="auth-form" onSubmit={handleLogin} noValidate>
              {/* Correo */}
              <div className="fld">
                <i className="bi bi-envelope fld__icon" />
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  autoComplete="email"
                  required
                  className="fld__control"
                  placeholder=" " /* necesario para floating label */
                />
                <label htmlFor="correo" className="fld__label">Correo electrónico</label>
              </div>

              {/* Password */}
              <div className="fld">
                <i className="bi bi-lock fld__icon" />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className={`fld__control ${mensaje ? "is-invalid" : ""}`}
                  placeholder=" "
                />
                <label htmlFor="password" className="fld__label">Contraseña</label>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPass((s) => !s)}
                >
                  <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>

              <div className="form-row">
                <label className="check">
                  <input type="checkbox" /> Recuérdame
                </label>
                <a className="link" href="#" onClick={(e) => e.preventDefault()}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {!!mensaje && (
                <div className="auth-alert">
                  <i className="bi bi-exclamation-triangle-fill" />
                  {mensaje}
                </div>
              )}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? <span className="spinner" /> : <i className="bi bi-box-arrow-in-right" />}
                {loading ? "Ingresando..." : "Ingresar"}
              </button>

              <div className="auth-foot muted">
                ¿No tienes cuenta?{" "}
                <a className="link" href="#" onClick={(e) => e.preventDefault()}>
                  Contacta al administrador
                </a>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
