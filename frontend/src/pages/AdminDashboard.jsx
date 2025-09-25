import Navbar from "../components/Navbar";
import CardModule from "../components/CardModule";
import { FaUsers, FaFileAlt, FaFolderOpen, FaChartBar } from "react-icons/fa";

export default function AdminDashboard() {
  const nombre = localStorage.getItem("nombre") || "Administrador";
  const rol = localStorage.getItem("rol") || "admin";

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Navbar rol={rol} nombre={nombre} />

      <main className="admin-dashboard-wrapper">
  {/* Título centrado */}
  <h1 className="admin-title mb-5">
    Bienvenido <span style={{ color: '#4f46e5' }}>{nombre}</span>, este es tu Dashboard de <span className="text-uppercase">{rol}</span>
  </h1>

  {/* Tarjetas en grilla */}
  <div className="dashboard-cards-container">
    <CardModule
      icon={<FaUsers className="dashboard-card-icon text-primary" />}
      title="Gestión de Usuarios"
      link="/admin/usuarios"
    />
    <CardModule
      icon={<FaFileAlt className="dashboard-card-icon text-success" />}
      title="Crear Formulario"
      link="/admin/formulario/crear"
    />
    <CardModule
      icon={<FaFolderOpen className="dashboard-card-icon text-warning" />}
      title="Gestionar Formularios"
      link="/admin/formularios"
    />
    <CardModule
      icon={<FaChartBar className="dashboard-card-icon text-info" />}
      title="Reportes"
      link="/admin/reportes"
    />
  </div>
</main>

    </div>
  );
}
