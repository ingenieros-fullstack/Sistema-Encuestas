// src/components/modals/AsignarFormulariosModal.jsx
import { useEffect, useMemo, useState } from "react";
import "../../css/AsignarFormularios.css";

export default function AsignarFormulariosModal({ onClose }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [usuarios, setUsuarios] = useState([]);
  const [formularios, setFormularios] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);

  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);
  const [formulariosSeleccionados, setFormulariosSeleccionados] = useState([]);

  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [busquedaAsignacion, setBusquedaAsignacion] = useState("");
  const [busquedaFormulario, setBusquedaFormulario] = useState("");

  // Tabs para Formularios
  const [tabFormularios, setTabFormularios] = useState("encuestas"); // "encuestas" | "cuestionarios"

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Usuarios
    fetch(`${API_URL}/admin/usuarios`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsuarios(data.usuarios || []))
      .catch((err) => console.error("Error cargando usuarios:", err));

    // Formularios
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

    // Asignaciones
    fetch(`${API_URL}/admin/asignaciones`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAsignaciones(data.asignaciones || []))
      .catch((err) => console.error("Error cargando asignaciones:", err));
  }, []);

  // Helpers selección
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

  const toggleAllUsuarios = (lista) => {
    const ids = lista.map((u) => u.id_usuario);
    const allSelected = ids.every((id) => usuariosSeleccionados.includes(id));
    setUsuariosSeleccionados(allSelected ? [] : ids);
  };

  const toggleAllFormularios = (lista) => {
    const codes = lista.map((f) => f.codigo);
    const allSelected = codes.every((c) => formulariosSeleccionados.includes(c));
    setFormulariosSeleccionados(allSelected ? [] : codes);
  };

  // POST asignar
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
          setAsignaciones((prev) => [...prev, ...(data.asignaciones || [])]);
          onClose();
        } else {
          alert("No se pudieron guardar las asignaciones ❌");
        }
      })
      .catch(() => alert("Error al guardar asignaciones ❌"));
  };

  // DELETE desasignar
  const handleDesasignar = (id_asignacion) => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/admin/asignaciones/${id_asignacion}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAsignaciones((prev) => prev.filter((a) => a.id_asignacion !== id_asignacion));
          alert("Asignación eliminada ❌");
        } else {
          alert("No se pudo eliminar la asignación");
        }
      })
      .catch(() => alert("Error al eliminar asignación ❌"));
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-backdrop")) onClose();
  };

  // Derivados y filtros
  const usuariosFiltrados = useMemo(() => {
    const q = busquedaUsuario.trim().toLowerCase();
    return usuarios.filter((u) =>
      (u.correo_electronico || "").toLowerCase().includes(q)
    );
  }, [usuarios, busquedaUsuario]);

  const encuestas = useMemo(
    () =>
      formularios.filter((f) =>
        (f.tipo || "").toLowerCase().startsWith("encuesta")
      ),
    [formularios]
  );

  const cuestionarios = useMemo(
    () =>
      formularios.filter((f) =>
        (f.tipo || "cuestionario").toLowerCase().startsWith("cuestionario")
      ),
    [formularios]
  );

  const listaFormulariosActiva = useMemo(() => {
    const base = tabFormularios === "encuestas" ? encuestas : cuestionarios;
    const q = busquedaFormulario.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (f) =>
        (f.titulo || "").toLowerCase().includes(q) ||
        (f.codigo || "").toLowerCase().includes(q)
    );
  }, [tabFormularios, encuestas, cuestionarios, busquedaFormulario]);

  const asignacionesFiltradas = useMemo(() => {
    const q = busquedaAsignacion.trim().toLowerCase();
    return asignaciones.filter((a) =>
      (a.Usuario?.correo_electronico || "").toLowerCase().includes(q)
    );
  }, [asignaciones, busquedaAsignacion]);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="asignar-modal-container card-elev">
        {/* Header */}
        <div className="asignar-modal-header">
          <div className="header-left">
            <span className="badge-icon">🧩</span>
            <div>
              <h5 className="asignar-title">Asignar Formularios</h5>
              <p className="asignar-subtitle">Selecciona usuarios y divide formularios por categoría.</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        {/* Body */}
        <div className="asignar-modal-body">
          {/* Panel Izquierdo - Usuarios */}
          <div className="panel">
            <div className="panel-title">
              <span>👤 Usuarios</span>
              <button
                className="link-small"
                onClick={() => toggleAllUsuarios(usuariosFiltrados)}
              >
                {usuariosFiltrados.length > 0 &&
                usuariosFiltrados.every((u) => usuariosSeleccionados.includes(u.id_usuario))
                  ? "Deseleccionar todos"
                  : "Seleccionar todos"}
              </button>
            </div>

            <div className="search-input">
              <input
                type="text"
                placeholder="Buscar por correo…"
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
              />
            </div>

            <div className="list-scroll">
              {usuariosFiltrados.length === 0 ? (
                <div className="empty">Sin resultados</div>
              ) : (
                usuariosFiltrados.map((u) => (
                  <label key={u.id_usuario} className="list-item">
                    <input
                      type="checkbox"
                      checked={usuariosSeleccionados.includes(u.id_usuario)}
                      onChange={() => handleUsuarioToggle(u.id_usuario)}
                    />
                    <div className="list-texts">
                      <span className="title">{u.correo_electronico}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Panel Medio - Formularios con Tabs */}
          <div className="panel">
            <div className="panel-title"><span>📑 Formularios</span></div>

            <div className="tabs">
              <button
                className={`tab ${tabFormularios === "encuestas" ? "active" : ""}`}
                onClick={() => setTabFormularios("encuestas")}
              >
                Encuestas <span className="tab-count">{encuestas.length}</span>
              </button>
              <button
                className={`tab ${tabFormularios === "cuestionarios" ? "active" : ""}`}
                onClick={() => setTabFormularios("cuestionarios")}
              >
                Cuestionarios <span className="tab-count">{cuestionarios.length}</span>
              </button>
            </div>

            <div className="panel-toolbar">
              <div className="search-input">
                <input
                  type="text"
                  placeholder="Buscar por título o código…"
                  value={busquedaFormulario}
                  onChange={(e) => setBusquedaFormulario(e.target.value)}
                />
              </div>
              <button
                className="link-small"
                onClick={() => toggleAllFormularios(listaFormulariosActiva)}
              >
                {listaFormulariosActiva.length > 0 &&
                listaFormulariosActiva.every((f) =>
                  formulariosSeleccionados.includes(f.codigo)
                )
                  ? "Deseleccionar"
                  : "Seleccionar todos"}
              </button>
            </div>

            <div className="list-scroll">
              {listaFormulariosActiva.length === 0 ? (
                <div className="empty">No hay formularios en esta categoría</div>
              ) : (
                listaFormulariosActiva.map((f) => (
                  <label key={f.codigo} className="list-item">
                    <input
                      type="checkbox"
                      checked={formulariosSeleccionados.includes(f.codigo)}
                      onChange={() => handleFormularioToggle(f.codigo)}
                    />
                    <div className="list-texts">
                      <span className="title">{f.titulo || "(Sin título)"}</span>
                      <span className="desc">Código: {f.codigo}</span>
                    </div>
                    <span className={`chip ${ (f.tipo || "").toLowerCase().startsWith("encuesta") ? "chip-green":"chip-indigo"}`}>
                      {(f.tipo || "Cuestionario")}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Panel Derecho - Asignaciones */}
          <div className="panel">
            <div className="panel-title"><span>🔗 Asignaciones</span></div>

            <div className="search-input">
              <input
                type="text"
                placeholder="Buscar por correo…"
                value={busquedaAsignacion}
                onChange={(e) => setBusquedaAsignacion(e.target.value)}
              />
            </div>

            <div className="list-scroll">
              {asignacionesFiltradas.length === 0 ? (
                <div className="empty">Aún no hay asignaciones</div>
              ) : (
                asignacionesFiltradas.map((a) => (
                  <div key={a.id_asignacion} className="list-item between">
                    <div className="list-texts">
                      <span className="title">{a.Usuario?.correo_electronico}</span>
                      <span className="desc">{a.Formulario?.titulo} — {a.Formulario?.codigo}</span>
                    </div>
                    <button
                      className="btn-icon danger"
                      title="Eliminar asignación"
                      onClick={() => handleDesasignar(a.id_asignacion)}
                    >
                      ❌
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="asignar-modal-footer">
          <div className="footer-left">
            <span className="meta">Usuarios: <b>{usuariosSeleccionados.length}</b></span>
            <span className="dot" />
            <span className="meta">Formularios: <b>{formulariosSeleccionados.length}</b></span>
          </div>
          <div className="footer-right">
            <button className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" onClick={handleAsignar}>Asignar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
