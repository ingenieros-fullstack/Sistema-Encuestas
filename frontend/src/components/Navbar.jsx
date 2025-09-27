import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ rol, nombre }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-custom px-4 py-3">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* IZQUIERDA: Logo + Título */}
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-shield-fill-exclamation fs-4 text-logo"></i>
          <span className="fw-bold fs-5 text-white">
            Panel {rol.toUpperCase()}
          </span>
        </div>

        {/* CENTRO: Nombre del usuario */}
        <div className="d-none d-md-flex align-items-center gap-2">
          <i className="bi bi-person-circle fs-5 text-custom"></i>
          <strong className="fs-6 text-white">{nombre}</strong>
        </div>

        {/* DERECHA: Botones */}
        <div className="d-flex align-items-center gap-3">
          {/* Botón Dashboard */}
          <Link
            to={`/${rol}/dashboard`}
            className="btn btn-sm fw-bold text-dark"
            style={{
              backgroundColor: "#7aa77dff",
              border: "none",
            }}
          >
            <i className="bi bi-layout-text-window me-1"></i> Inicio
          </Link>

          {/* Botón Logout */}
          <button
            onClick={handleLogout}
            className="btn btn-sm fw-bold text-danger border border-danger"
            style={{ backgroundColor: "transparent" }}
          >
            <i className="bi bi-box-arrow-right me-1"></i> Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
