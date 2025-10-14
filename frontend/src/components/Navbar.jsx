import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo4front from "/src/images/Logo2.png"; // ajusta el nombre del archivo si cambió
import "../css/Navbar.css";

export default function Navbar({ rol = "empleado", nombre = "Usuario" }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const rolPretty = useMemo(() => {
    const r = (rol || "").toString();
    return r.charAt(0).toUpperCase() + r.slice(1);
  }, [rol]);

  const initials = useMemo(() => {
    const parts = (nombre || "U").trim().split(/\s+/);
    const a = (parts[0]?.[0] || "").toUpperCase();
    const b = (parts[1]?.[0] || "").toUpperCase();
    return (a + (b || "")).slice(0, 2) || "U";
  }, [nombre]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="nbx-wrap">
      <nav className="nbx-bar">
        <div className="nbx-inner">
          {/* Marca */}
          <Link to={`/${rol}/dashboard`} className="nbx-brand" aria-label="Inicio">
            <div className="nbx-logo">
              <i className="bi bi-shield-fill-exclamation" />
            </div>
            <div className="nbx-brandText">
              <span className="nbx-app">Panel</span>{" "}
              <span className="nbx-role">{rolPretty}</span>
            </div>
          </Link>

          {/* Burger */}
          <button
            className="nbx-burger"
            aria-label="Abrir menú"
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>

          {/* Contenido derecho */}
          <div className={`nbx-right ${open ? "is-open" : ""}`}>
            <div className="nbx-user">
              <div className="nbx-avatar" aria-hidden="true">{initials}</div>
              <div className="nbx-userMeta">
                <div className="nbx-name" title={nombre}>{nombre}</div>
                <span className={`nbx-chip nbx-chip--${rol}`}>{rolPretty}</span>
              </div>
            </div>

            <div className="nbx-actions">
              <Link to={`/${rol}/dashboard`} className="nbx-btn nbx-btn--primary">
                <i className="bi bi-layout-text-window me-1" /> Inicio
              </Link>
              <button onClick={handleLogout} className="nbx-btn nbx-btn--outlineDanger">
                <i className="bi bi-box-arrow-right me-1" /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
        <img src={logo4front} alt="4Front" className="navbar-centered-logo" />
      </nav>
    </header>
  );
}
