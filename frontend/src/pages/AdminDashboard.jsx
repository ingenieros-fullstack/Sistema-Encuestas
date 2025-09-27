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
