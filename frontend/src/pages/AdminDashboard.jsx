import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import CardModule from "../components/CardModule";
import ChangePasswordModal from "../components/modals/ChangePasswordModal";
import {
  FaUsers,
  FaFileAlt,
  FaFolderOpen,
  FaChartBar,
  FaClipboardCheck,
} from "react-icons/fa";
import "../AdminPrincipal.css";

export default function AdminDashboard() {
  const nombre = localStorage.getItem("nombre") || "Administrador";
  const rol = localStorage.getItem("rol") || "admin";
  const token = localStorage.getItem("token");

  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [correo, setCorreo] = useState("");

  // ✅ Base API URL (desde .env)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // ✅ Verificar usuario y si debe cambiar la contraseña
  useEffect(() => {
    if (!token) return;

    const verificarUsuario = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.text();
          console.error("❌ Error en /auth/me:", err);
          return;
        }

        const data = await res.json();
        if (data?.mustChangePassword) {
          setMustChangePassword(true);
          setCorreo(data.correo);
        }
      } catch (err) {
        console.error("⚠️ Error al verificar el usuario:", err);
      }
    };

    verificarUsuario();
  }, [token, API_URL]);

  return (
    <div className="dashboard-wrapper">
      {/* Barra superior */}
      <Navbar rol={rol} nombre={nombre} />

      {/* Contenido principal */}
      <main className="dashboard-content container text-center">
        <h1 className="dashboard-title">
          Bienvenido <span className="highlight">{nombre}</span>, este es tu{" "}
          <span className="text-uppercase highlight">{rol}</span> Dashboard
        </h1>

        <div className="dashboard-cards">
          {/* Gestión de usuarios */}
          <CardModule
            icon={<FaUsers />}
            title="Gestión de Usuarios"
            link="/admin/usuarios"
            type="usuarios"
            description="Crear, editar o eliminar usuarios."
          />

          {/* Nueva tarjeta: Asignar Formularios */}
          <CardModule
            icon={<FaClipboardCheck />}
            title="Asignar Formularios"
            link="/admin/asignar-formularios"
            type="asignar"
            description="Asigna formularios a empleados o supervisores."
          />

          {/* Crear Formulario */}
          <CardModule
            icon={<FaFileAlt />}
            title="Crear Formulario"
            link="/admin/formulario/crear"
            type="crear"
            description="Diseña nuevos formularios personalizados."
          />

          {/* Gestionar Formularios */}
          <CardModule
            icon={<FaFolderOpen />}
            title="Gestionar Formularios"
            link="/admin/formularios"
            type="gestionar"
            description="Edita o elimina formularios existentes."
          />

          {/* Reportes */}
          <CardModule
            icon={<FaChartBar />}
            title="Reportes"
            link="/admin/reportes"
            type="reportes"
            description="Visualiza estadísticas y exporta datos."
          />
        </div>
      </main>

      {/* Modal de cambio de contraseña obligatorio */}
      {mustChangePassword && (
        <ChangePasswordModal
          onClose={() => setMustChangePassword(false)}
          correo={correo}
        />
      )}
    </div>
  );
}
