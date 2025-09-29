// src/components/modals/AsignarFormulariosModal.jsx
import { useEffect, useState } from "react";
import "../../AsignarFormularios.css";

export default function AsignarFormulariosModal({ onClose }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [usuarios, setUsuarios] = useState([]);
  const [formularios, setFormularios] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);

  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);
  const [formulariosSeleccionados, setFormulariosSeleccionados] = useState([]);

  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [busquedaAsignacion, setBusquedaAsignacion] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 🔹 GET /admin/usuarios
    fetch(`${API_URL}/admin/usuarios`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsuarios(data.usuarios || []))
      .catch((err) => console.error("Error cargando usuarios:", err));

    // 🔹 GET /admin/formularios
    fetch(`${API_URL}/admin/formularios`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFormularios(data);
        } else if (Array.isArray(data.formularios)) {
          setFormularios(data.formularios);
        } else {
          setFormularios([]);
        }
      })
      .catch((err) => console.error("Error cargando formularios:", err));

    // 🔹 GET /admin/asignaciones
    fetch(`${API_URL}/admin/asignaciones`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAsignaciones(data.asignaciones || []))
      .catch((err) => console.error("Error cargando asignaciones:", err));
  }, []);

  const handleUsuarioToggle = (id) => {
    setUsuariosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleFormularioToggle = (codigo) => {
    setFormulariosSeleccionados((prev) =>
      prev.includes(codigo) ? prev.filter((f) => f !== codigo) : [...prev, codigo]
    );
  };

  const handleAsignar = () => {
    if (usuariosSeleccionados.length === 0 || formulariosSeleccionados.length === 0) {
      alert("Debes seleccionar al menos un usuario y un formulario.");
      return;
    }

    const token = localStorage.getItem("token");
    fetch(`${API_URL}/admin/asignaciones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        usuarios: usuariosSeleccionados,
        formularios: formulariosSeleccionados,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Asignaciones guardadas ✅");
          setAsignaciones((prev) => [...prev, ...data.asignaciones]); // refrescar
          onClose();
        } else {
          alert("No se pudieron guardar las asignaciones ❌");
        }
      })
      .catch(() => alert("Error al guardar asignaciones ❌"));
  };

  const handleDesasignar = (id_asignacion) => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/admin/asignaciones/${id_asignacion}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAsignaciones((prev) =>
            prev.filter((a) => a.id_asignacion !== id_asignacion)
          );
          alert("Asignación eliminada ❌");
        } else {
          alert("No se pudo eliminar la asignación");
        }
      })
      .catch(() => alert("Error al eliminar asignación ❌"));
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="asignar-modal-container">
        {/* Header */}
        <div className="asignar-modal-header">
          <h5 className="asignar-title">📝 Asignar Formularios</h5>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Body con tres paneles */}
        <div className="asignar-modal-body">
          {/* Panel Izquierdo - Usuarios */}
          <div className="panel">
            <h6>👤 Usuarios</h6>
            <input
              type="text"
              placeholder="Buscar por correo..."
              value={busquedaUsuario}
              onChange={(e) => setBusquedaUsuario(e.target.value)}
              className="search-bar"
            />
            <div className="list-scroll">
              {usuarios
                .filter((u) =>
                  u.correo_electronico
                    ?.toLowerCase()
                    .includes(busquedaUsuario.toLowerCase())
                )
                .map((u) => (
                  <label key={u.id_usuario} className="list-item">
                    <input
                      type="checkbox"
                      checked={usuariosSeleccionados.includes(u.id_usuario)}
                      onChange={() => handleUsuarioToggle(u.id_usuario)}
                    />
                    {u.correo_electronico}
                  </label>
                ))}
            </div>
          </div>

          {/* Panel Medio - Formularios */}
          <div className="panel">
            <h6>📑 Formularios</h6>
            <div className="list-scroll">
              {formularios.map((f) => (
                <label key={f.codigo} className="list-item">
                  <input
                    type="checkbox"
                    checked={formulariosSeleccionados.includes(f.codigo)}
                    onChange={() => handleFormularioToggle(f.codigo)}
                  />
                  {f.titulo}
                </label>
              ))}
            </div>
          </div>

          {/* Panel Derecho - Asignaciones */}
          <div className="panel">
            <h6>🔗 Asignaciones</h6>
            <input
              type="text"
              placeholder="Buscar por correo..."
              value={busquedaAsignacion}
              onChange={(e) => setBusquedaAsignacion(e.target.value)}
              className="search-bar"
            />
            <div className="list-scroll">
              {asignaciones
                .filter((a) =>
                  a.Usuario?.correo_electronico
                    ?.toLowerCase()
                    .includes(busquedaAsignacion.toLowerCase())
                )
                .map((a) => (
                  <div key={a.id_asignacion} className="list-item">
                    <span>
                      {a.Usuario?.correo_electronico} → {a.Formulario?.titulo}
                    </span>
                    <button
                      className="btn-secondary"
                      onClick={() => handleDesasignar(a.id_asignacion)}
                    >
                      ❌
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="asignar-modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleAsignar}>
            Asignar
          </button>
        </div>
      </div>
    </div>
  );
}
