import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/src/images/VelCodelogoOficial.png";
import logo4front from "/src/images/Logo2.png";

import "/src/login.css";

export default function Login() {
  const [identificador, setIdentificador] = useState(""); // correo o código
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // === Tema persistente ===
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
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

      // 🧩 Detectar si el usuario ingresó correo o código
      const esCorreo = identificador.includes("@");
      const payload = esCorreo
        ? { correo: identificador.trim(), password }
        : { numero_empleado: identificador.trim(), password };

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.warn("⚠️ Error en login:", data);
        setMensaje(data.message || "Credenciales incorrectas");
        return;
      }

      // === Guardar datos esenciales ===
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.rol || "");
      localStorage.setItem("nombre", data.nombre || "");
      localStorage.setItem("correo_electronico", data.correo_electronico || "");
      localStorage.setItem("numero_empleado", data.numero_empleado || "");
      localStorage.setItem("mustChangePassword", data.mustChangePassword || "false");

      // === Redirección si debe cambiar contraseña ===
      if (data.mustChangePassword && ["empleado", "supervisor"].includes(data.rol)) {
        navigate("/change-password", { replace: true });
        return;
      }

      // === Determinar destino por rol ===
      let destino = "/";
      switch (data.rol) {
        case "admin":
          destino = "/admin/dashboard";
          break;
        case "supervisor":
          destino = "/supervisor/dashboard";
          break;
        case "empleado":
          destino = "/empleado/dashboard";
          break;
        default:
          destino = "/";
      }

      // === Redirección limpia ===
      setTimeout(() => {
        window.location.href = destino;
      }, 200);

    } catch (err) {
      console.error("❌ Error de conexión con el backend:", err);
      setMensaje("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth auth--v2">
      {/* 🌌 decoraciones */}
      <div className="aurora" />
      <div className="stars" />

      {/* ☀️/🌙 toggle */}
      <button
        className="theme-toggle"
        type="button"
        aria-label="Cambiar tema"
        onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      >
        <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"}`} />
      </button>

      <div className="auth__surface">
        {/* PANEL IZQUIERDO */}
        <aside className="auth__aside">
          <div className="auth__brand">
  <div className="auth__logos">
    <img src={logo} alt="VelCode" className="auth__logo-img" />
  </div>
  <h1>Sistema de Encuestas</h1>
  <p>Diseña, gestiona y analiza encuestas con estilo moderno.</p>
</div>


          <ul className="auth__bullets">
            <li><i className="bi bi-shield-check" /> Seguridad y confiabilidad</li>
            <li><i className="bi bi-speedometer2" /> Paneles ágiles y claros</li>
            <li><i className="bi bi-bar-chart-line" /> Reportes y métricas</li>
          </ul>

          <div className="auth__shape" aria-hidden>
  <img src={logo4front} alt="4Front" className="logo-4front" />
</div>
        </aside>

        {/* PANEL DERECHO */}
        <main className="auth__panel">
          <div className="auth-card auth-card--border">
            <div className="auth-card__head">
              <span className="auth-card__badge">
                <i className="bi bi-shield-lock" /> Acceso
              </span>
              <h2>Iniciar sesión</h2>
              <p className="muted">
                Puedes ingresar con tu <b>correo</b> o tu <b>código de empleado</b>.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleLogin} noValidate>
              {/* Identificador (correo o código) */}
              <div className="fld">
                <i className="bi bi-person-badge fld__icon" />
                <input
                  id="identificador"
                  type="text"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  required
                  className="fld__control"
                  placeholder=" "
                />
                <label htmlFor="identificador" className="fld__label">
                  Correo o número de empleado
                </label>
              </div>

              {/* Contraseña */}
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

              {/* Opciones */}
              <div className="form-row">
                <label className="check">
                  <input type="checkbox" /> Recuérdame
                </label>
                <a className="link" href="#" onClick={(e) => e.preventDefault()}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Mensaje de error */}
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
