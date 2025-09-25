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
    <nav
      style={{
        background: "#1e293b", // slate-800
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
      }}
    >
      <div>
        <h2>Panel {rol.toUpperCase()}</h2>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <span>👤 {nombre}</span>
        {rol === "admin" && <Link to="/admin/dashboard">Dashboard</Link>}
        {rol === "empleado" && <Link to="/empleado/dashboard">Dashboard</Link>}
        {rol === "supervisor" && (
          <Link to="/supervisor/dashboard">Dashboard</Link>
        )}
        <button
          onClick={handleLogout}
          style={{
            background: "#ef4444", // red-500
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
