// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import CardModule from "../components/CardModule";
import ChangePasswordModal from "../components/modals/ChangePasswordModal";
import { FaUsers, FaFileAlt, FaFolderOpen, FaChartBar } from "react-icons/fa";
import "../AdminPrincipal.css";

export default function AdminDashboard() {
  const nombre = localStorage.getItem("nombre") || "Administrador";
  const rol = localStorage.getItem("rol") || "admin";
  const token = localStorage.getItem("token");

  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [correo, setCorreo] = useState("");

  // ✅ Base API URL (desde .env)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!token) return;

    // ✅ Fetch dinámico para entorno local o producción
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.text();
          console.error("❌ Error en /auth/me:", err);
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.mustChangePassword) {
          setMustChangePassword(true);
          setCorreo(data.correo);
        }
      })
      .catch((err) => {
        console.error("⚠️ Error al verificar el usuario:", err);
      });
  }, [token, API_URL]);

  return (
    <div className="dashboard-wrapper">
      <Navbar rol={rol} nombre={nombre} />

      <main className="dashboard-content container text-center">
        <h1 className="dashboard-title">
          Bienvenido <span className="highlight">{nombre}</span>, este es tu
          Dashboard de{" "}
          <span className="text-uppercase highlight">{rol}</span>
        </h1>

        <div className="dashboard-cards">
          <CardModule
            icon={<FaUsers />}
            title="Gestión de Usuarios"
            link="/admin/usuarios"
            type="usuarios"
            description="Crear, editar o eliminar usuarios."
          />

          <CardModule
            icon={<FaFileAlt />}
            title="Crear Formulario"
            link="/admin/formulario/crear"
            type="crear"
            description="Diseña nuevos formularios personalizados."
          />

          <CardModule
            icon={<FaFolderOpen />}
            title="Gestionar Formularios"
            link="/admin/formularios"
            type="gestionar"
            description="Edita, asigna o elimina formularios existentes."
          />

          <CardModule
            icon={<FaChartBar />}
            title="Reportes"
            link="/admin/reportes"
            type="reportes"
            description="Visualiza estadísticas y exporta datos."
          />
        </div>
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
