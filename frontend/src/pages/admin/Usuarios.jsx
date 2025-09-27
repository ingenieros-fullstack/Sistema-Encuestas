// src/pages/admin/Usuarios.jsx
import { useState } from "react";
import Navbar from "../../components/Navbar";
import ImportarUsuariosModal from "../../components/modals/ImportarUsuariosModal";
import GestionUsuariosModal from "../../components/modals/GestionUsuariosModal";
import AsignarFormulariosModal from "../../components/modals/AsignarFormulariosModal";
import "../../Usuarios.css";

export default function Usuarios() {
  const [modal, setModal] = useState(null);
  const abrirModal = (nombre) => setModal(nombre);
  const cerrarModal = () => setModal(null);

  const nombre = localStorage.getItem("nombre") || "Administrador";
  const rol = localStorage.getItem("rol") || "admin";

  return (
    <>
      <Navbar rol={rol} nombre={nombre} />

      <div className="usuarios-wrapper">
        <h1 className="usuarios-title">Gestión de Usuarios</h1>

        <div className="user-card-container">
          <div
            className="user-card importar"
            onClick={() => abrirModal("importar")}
          >
            <div className="icon-box">
              <i className="bi bi-cloud-arrow-up icon"></i>
            </div>
            <h5>Importar Usuarios</h5>
            <p>Carga masiva de usuarios desde un archivo Excel o CSV.</p>
          </div>

          <div
            className="user-card gestion"
            onClick={() => abrirModal("gestion")}
          >
            <div className="icon-box">
              <i className="bi bi-people-fill icon"></i>
            </div>
            <h5>Gestión de Usuarios</h5>
            <p>Crear, editar o eliminar usuarios de manera individual.</p>
          </div>

          <div
            className="user-card asignar"
            onClick={() => abrirModal("asignar")}
          >
            <div className="icon-box">
              <i className="bi bi-clipboard-check icon"></i>
            </div>
            <h5>Asignar Formularios</h5>
            <p>Asigna formularios a empleados o supervisores.</p>
          </div>
        </div>

        {/* Un solo contenedor de modales */}
        {modal && (
          <>
            {modal === "importar" && (
              <ImportarUsuariosModal key="importar" onClose={cerrarModal} />
            )}
            {modal === "gestion" && (
              <GestionUsuariosModal key="gestion" onClose={cerrarModal} />
            )}
            {modal === "asignar" && (
              <AsignarFormulariosModal key="asignar" onClose={cerrarModal} />
            )}
          </>
        )}
      </div>
    </>
  );
}
