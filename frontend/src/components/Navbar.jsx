import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ rol, nombre }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("nombre");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">
        {/* Left: Título */}
        <span className="navbar-brand fw-bold">Panel {rol.toUpperCase()}</span>

        {/* Right: contenido del navbar */}
        <div className="d-flex align-items-center ms-auto gap-3">
          {/* Nombre de usuario */}
          <span className="text-white">
            👤 <strong>{nombre}</strong>
          </span>

          {/* Link al Dashboard */}
          {rol === "admin" && (
            <Link to="/admin/dashboard" className="nav-link text-info">
              Dashboard
            </Link>
          )}
          {rol === "empleado" && (
            <Link to="/empleado/dashboard" className="nav-link text-info">
              Dashboard
            </Link>
          )}
          {rol === "supervisor" && (
            <Link to="/supervisor/dashboard" className="nav-link text-info">
              Dashboard
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
