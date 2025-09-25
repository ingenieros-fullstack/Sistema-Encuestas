// src/pages/admin/Usuarios.jsx
import { useState } from "react";
import Navbar from "../../components/Navbar"; // ✅ Importar navbar
import ImportarUsuariosModal from "../../components/modals/ImportarUsuariosModal";
import GestionUsuariosModal from "../../components/modals/GestionUsuariosModal";
import AsignarFormulariosModal from "../../components/modals/AsignarFormulariosModal";

export default function Usuarios() {
  const [modal, setModal] = useState(null);
  const abrirModal = (nombre) => setModal(nombre);
  const cerrarModal = () => setModal(null);

  // Leer nombre y rol desde localStorage (como ya haces en otros componentes)
  const nombre = localStorage.getItem("nombre") || "Administrador";
  const rol = localStorage.getItem("rol") || "admin";

  return (
    <>
      {/* ✅ Navbar arriba */}
      <Navbar rol={rol} nombre={nombre} />

      {/* Contenido principal */}
      <div className="container py-5">
        <h1 className="fw-bold text-center text-primary mb-5">Gestión de Usuarios</h1>

        <div className="usuarios-grid">
          {/* Fila 1 */}
          <div className="usuarios-grid-row">
            <div className="card dashboard-card" onClick={() => abrirModal("importar")}>
              <div className="card-body text-center">
                <div className="dashboard-card-icon">📥</div>
                <h5 className="card-title">Importar Usuarios</h5>
                <p className="text-muted small">
                  Carga masiva de usuarios desde un archivo Excel o CSV.
                </p>
              </div>
            </div>

            <div className="card dashboard-card" onClick={() => abrirModal("gestion")}>
              <div className="card-body text-center">
                <div className="dashboard-card-icon">👥</div>
                <h5 className="card-title">Gestión de Usuarios</h5>
                <p className="text-muted small">
                  Crear, editar o eliminar usuarios de manera individual.
                </p>
              </div>
            </div>
          </div>

          {/* Fila 2 */}
          <div className="usuarios-grid-row">
            <div className="card dashboard-card" onClick={() => abrirModal("asignar")}>
              <div className="card-body text-center">
                <div className="dashboard-card-icon">📝</div>
                <h5 className="card-title">Asignar Formularios</h5>
                <p className="text-muted small">
                  Asigna formularios a empleados o supervisores.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modales */}
        {modal === "importar" && <ImportarUsuariosModal onClose={cerrarModal} />}
        {modal === "gestion" && <GestionUsuariosModal onClose={cerrarModal} />}
        {modal === "asignar" && <AsignarFormulariosModal onClose={cerrarModal} />}
      </div>
    </>
  );
}
