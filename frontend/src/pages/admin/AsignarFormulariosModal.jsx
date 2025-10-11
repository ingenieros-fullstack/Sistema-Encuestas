import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../css/AsignarFormularios.css";

export default function AsignarFormulariosModal() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [formularios, setFormularios] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);
  const [formulariosSeleccionados, setFormulariosSeleccionados] = useState([]);
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [busquedaFormulario, setBusquedaFormulario] = useState("");
  const [busquedaAsignacion, setBusquedaAsignacion] = useState("");
  const [tabFormularios, setTabFormularios] = useState("encuestas");

  const rol = localStorage.getItem("rol") || "admin";
  const nombre = localStorage.getItem("nombre") || "Administrador";

  // 🔹 Paginación
  const [paginaUsuarios, setPaginaUsuarios] = useState(1);
  const [paginaFormularios, setPaginaFormularios] = useState(1);
  const [paginaAsignaciones, setPaginaAsignaciones] = useState(1);
  const porPagina = 5; // cantidad de registros por página

  // ==============================
  // 🔹 Cargar datos iniciales
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem("token");

    const cargarDatos = async () => {
      try {
        const [resU, resF, resA] = await Promise.all([
          fetch(`${API_URL}/admin/usuarios`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/admin/formularios`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/admin/asignaciones`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const dataUsuarios = await resU.json();
        const dataFormularios = await resF.json();
        const dataAsignaciones = await resA.json();

        setUsuarios(dataUsuarios.usuarios || []);
        setFormularios(
          Array.isArray(dataFormularios)
            ? dataFormularios
            : dataFormularios.formularios || []
        );
        setAsignaciones(dataAsignaciones.asignaciones || []);
      } catch (err) {
        console.error("⚠️ Error cargando datos:", err);
      }
    };

    cargarDatos();
  }, [API_URL]);

  // ==============================
  // 🔹 Funciones principales
  // ==============================
  const handleUsuarioToggle = (id) => {
    setUsuariosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleFormularioToggle = (codigo) => {
    setFormulariosSeleccionados((prev) =>
      prev.includes(codigo)
        ? prev.filter((f) => f !== codigo)
        : [...prev, codigo]
    );
  };

  const handleAsignar = async () => {
    if (
      usuariosSeleccionados.length === 0 ||
      formulariosSeleccionados.length === 0
    ) {
      alert("Debes seleccionar al menos un usuario y un formulario.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/asignaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          usuarios: usuariosSeleccionados,
          formularios: formulariosSeleccionados,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Asignaciones guardadas ✅");
        const res2 = await fetch(`${API_URL}/admin/asignaciones`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data2 = await res2.json();
        setAsignaciones(data2.asignaciones || []);
        setUsuariosSeleccionados([]);
        setFormulariosSeleccionados([]);
      } else {
        alert("No se pudieron guardar las asignaciones ❌");
      }
    } catch (err) {
      console.error("❌ Error guardando asignaciones:", err);
      alert("Error al guardar asignaciones ❌");
    }
  };

  const handleDesasignar = async (id_asignacion) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/asignaciones/${id_asignacion}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setAsignaciones((prev) =>
          prev.filter((a) => a.id_asignacion !== id_asignacion)
        );
      } else {
        alert("No se pudo eliminar la asignación");
      }
    } catch (err) {
      console.error("❌ Error eliminando asignación:", err);
      alert("Error al eliminar asignación ❌");
    }
  };

  // ==============================
  // 🔹 Filtros y paginación
  // ==============================
  const usuariosFiltrados = useMemo(() => {
    const q = busquedaUsuario.trim().toLowerCase();
    return usuarios.filter((u) =>
      (u.correo_electronico || "").toLowerCase().includes(q)
    );
  }, [usuarios, busquedaUsuario]);

  const encuestas = formularios.filter((f) =>
    (f.tipo || "").toLowerCase().startsWith("encuesta")
  );

  const cuestionarios = formularios.filter((f) =>
    (f.tipo || "cuestionario").toLowerCase().startsWith("cuestionario")
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
    return asignaciones.filter(
      (a) =>
        (a.Usuario?.correo_electronico || "").toLowerCase().includes(q) ||
        (a.Formulario?.codigo || "").toLowerCase().includes(q)
    );
  }, [asignaciones, busquedaAsignacion]);

  // Paginación de listas
  const paginar = (lista, pagina) =>
    lista.slice((pagina - 1) * porPagina, pagina * porPagina);

  const usuariosPaginados = paginar(usuariosFiltrados, paginaUsuarios);
  const formulariosPaginados = paginar(listaFormulariosActiva, paginaFormularios);
  const asignacionesPaginadas = paginar(asignacionesFiltradas, paginaAsignaciones);

  // ==============================
  // 🔹 Render
  // ==============================
  return (
    <div className="asignar-page">
      <Navbar rol={rol} nombre={nombre} />

      <div className="container-fluid mt-4 px-5">
        <div className="asignar-modal-container-wide card-elev p-4">
          <div className="asignar-modal-header mb-3">
            <div className="header-left">
              <span className="badge-icon">🧩</span>
              <div>
                <h4 className="asignar-title">Asignar Formularios</h4>
                <p className="asignar-subtitle">
                  Selecciona usuarios y asigna formularios fácilmente.
                </p>
              </div>
            </div>
          </div>

          {/* Cuerpo principal */}
          <div className="asignar-modal-body large-layout">
            {/* Usuarios */}
            <div className="panel">
              <div className="panel-title">
                <span>👤 Usuarios</span>
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
                {usuariosPaginados.length === 0 ? (
                  <div className="empty">Sin resultados</div>
                ) : (
                  usuariosPaginados.map((u) => (
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

              {/* Paginación */}
              <div className="pagination">
                <button
                  disabled={paginaUsuarios === 1}
                  onClick={() => setPaginaUsuarios((p) => p - 1)}
                >
                  ←
                </button>
                <span>{paginaUsuarios}</span>
                <button
                  disabled={usuariosFiltrados.length <= paginaUsuarios * porPagina}
                  onClick={() => setPaginaUsuarios((p) => p + 1)}
                >
                  →
                </button>
              </div>
            </div>

            {/* Formularios */}
            <div className="panel">
              <div className="panel-title">
                <span>📑 Formularios</span>
              </div>

              <div className="tabs">
                <button
                  className={`tab ${
                    tabFormularios === "encuestas" ? "active" : ""
                  }`}
                  onClick={() => setTabFormularios("encuestas")}
                >
                  Encuestas
                </button>
                <button
                  className={`tab ${
                    tabFormularios === "cuestionarios" ? "active" : ""
                  }`}
                  onClick={() => setTabFormularios("cuestionarios")}
                >
                  Cuestionarios
                </button>
              </div>

              <div className="search-input">
                <input
                  type="text"
                  placeholder="Buscar formulario..."
                  value={busquedaFormulario}
                  onChange={(e) => setBusquedaFormulario(e.target.value)}
                />
              </div>

              <div className="list-scroll">
                {formulariosPaginados.length === 0 ? (
                  <div className="empty">Sin formularios</div>
                ) : (
                  formulariosPaginados.map((f) => (
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
                      <span
                        className={`chip ${
                          (f.tipo || "").toLowerCase().startsWith("encuesta")
                            ? "chip-green"
                            : "chip-indigo"
                        }`}
                      >
                        {f.tipo || "Cuestionario"}
                      </span>
                    </label>
                  ))
                )}
              </div>

              {/* Paginación */}
              <div className="pagination">
                <button
                  disabled={paginaFormularios === 1}
                  onClick={() => setPaginaFormularios((p) => p - 1)}
                >
                  ←
                </button>
                <span>{paginaFormularios}</span>
                <button
                  disabled={listaFormulariosActiva.length <= paginaFormularios * porPagina}
                  onClick={() => setPaginaFormularios((p) => p + 1)}
                >
                  →
                </button>
              </div>
            </div>

            {/* Asignaciones */}
            <div className="panel">
              <div className="panel-title">
                <span>🔗 Asignaciones</span>
              </div>
              <div className="search-input">
                <input
                  type="text"
                  placeholder="Buscar por correo…"
                  value={busquedaAsignacion}
                  onChange={(e) => setBusquedaAsignacion(e.target.value)}
                />
              </div>

              <div className="list-scroll">
                {asignacionesPaginadas.length === 0 ? (
                  <div className="empty">Aún no hay asignaciones</div>
                ) : (
                  asignacionesPaginadas.map((a) => (
                    <div key={a.id_asignacion} className="list-item between">
                      <div className="list-texts">
                        <span className="title">
                          {a.Usuario?.correo_electronico || "—"}
                        </span>
                        <span className="desc">
                          {a.Formulario?.titulo || "(Sin título)"} —{" "}
                          {a.Formulario?.codigo || "—"}
                        </span>
                      </div>
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDesasignar(a.id_asignacion)}
                      >
                        ❌
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Paginación */}
              <div className="pagination">
                <button
                  disabled={paginaAsignaciones === 1}
                  onClick={() => setPaginaAsignaciones((p) => p - 1)}
                >
                  ←
                </button>
                <span>{paginaAsignaciones}</span>
                <button
                  disabled={asignacionesFiltradas.length <= paginaAsignaciones * porPagina}
                  onClick={() => setPaginaAsignaciones((p) => p + 1)}
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="asignar-modal-footer mt-3">
            <div className="footer-left">
              <span className="meta">
                Usuarios: <b>{usuariosSeleccionados.length}</b>
              </span>
              <span className="dot" />
              <span className="meta">
                Formularios: <b>{formulariosSeleccionados.length}</b>
              </span>
            </div>
            <div className="footer-right">
              <button className="btn-primary" onClick={handleAsignar}>
                Asignar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
