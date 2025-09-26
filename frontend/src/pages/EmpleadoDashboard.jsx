// src/pages/EmpleadoDashboard.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ChangePasswordModal from "../components/modals/ChangePasswordModal";

export default function EmpleadoDashboard() {
  const nombre = localStorage.getItem("nombre") || "Empleado";
  const rol = localStorage.getItem("rol") || "empleado";

  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [correo, setCorreo] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:4000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.mustChangePassword) {
          setMustChangePassword(true);
          setCorreo(data.correo);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Navbar rol={rol} nombre={nombre} />

      <main style={{ padding: "2rem" }}>
        <h1>
          Bienvenido{" "}
          <span style={{ color: "#16a34a" }}>{nombre}</span>, este es tu
          Dashboard de <span className="text-uppercase">{rol}</span>
        </h1>
      </main>

      {/* Modal de cambio de contraseña */}
      {mustChangePassword && (
        <ChangePasswordModal
          onClose={() => setMustChangePassword(false)}
          correo={correo}
        />
      )}
    </div>
  );
}
