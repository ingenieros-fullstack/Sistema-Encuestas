import Navbar from "../components/Navbar";
import CardModule from "../components/CardModule";
import { FaUsers, FaFileAlt, FaFolderOpen, FaChartBar } from "react-icons/fa";

export default function AdminDashboard() {
  const nombre = localStorage.getItem("nombre") || "Administrador";
  const rol = localStorage.getItem("rol") || "admin";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar arriba */}
      <Navbar rol={rol} nombre={nombre} />

      {/* Contenido */}
      <main className="flex-1 p-6 bg-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            Bienvenido {nombre}, este es tu Dashboard de {rol.toUpperCase()}
          </h1>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardModule
            icon={<FaUsers size={40} className="text-blue-600" />}
            title="Gestión de Usuarios"
            link="/admin/usuarios"
          />
          <CardModule
            icon={<FaFileAlt size={40} className="text-green-600" />}
            title="Crear Formulario"
            link="/admin/formulario/crear"
          />
          <CardModule
            icon={<FaFolderOpen size={40} className="text-yellow-600" />}
            title="Gestionar Formularios"
            link="/admin/formularios"
          />
          <CardModule
            icon={<FaChartBar size={40} className="text-purple-600" />}
            title="Reportes"
            link="/admin/reportes"
          />
        </div>
      </main>
    </div>
  );
}
