import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChangePasswordModal from "../components/modals/ChangePasswordModal";
import "../css/EmpleadoDashboard.css";

export default function EmpleadoDashboard() {
  const nombre = localStorage.getItem("nombre") || "Empleado";
  const rol = localStorage.getItem("rol") || "empleado";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [correo, setCorreo] = useState("");
  const [formularios, setFormularios] = useState([]);

  // UI
  const [filtro, setFiltro] = useState("pendientes");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recientes");
  const [density, setDensity] = useState("comfortable");
  const [selectedForm, setSelectedForm] = useState(null); // ✅ antes no existía

  // Paginación
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const gridRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Helpers
  const toDateStr = (d) => (d ? new Date(d).toLocaleDateString() : "N/A");
  const minutesLabel = (m) => (m ? `${m} min` : "Sin límite");
  const timeLeft = (fin) => {
    if (!fin) return null;
    const diff = new Date(fin).getTime() - Date.now();
    if (diff <= 0) return "Finalizó";
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return d > 0 ? `${d}d ${h}h` : `${h}h`;
  };
  const progressFor = (inicioISO, finISO) => {
    if (!finISO) return { pct: null, tone: "ok" };
    const now = Date.now();
    const ini = inicioISO ? new Date(inicioISO).getTime() : now - 1;
    const fin = new Date(finISO).getTime();
    if (Number.isNaN(ini) || Number.isNaN(fin) || fin <= ini)
      return { pct: null, tone: "ok" };
    const pct = Math.max(0, Math.min(100, ((now - ini) / (fin - ini)) * 100));
    const tone = pct < 50 ? "ok" : pct < 85 ? "warn" : "danger";
    return { pct, tone };
  };
  const estadoChip = (estado) => {
    const e = (estado || "").toLowerCase();
    if (e === "completado") return { text: "Completado", className: "chip chip-ok" };
    if (e === "pendiente") return { text: "Pendiente", className: "chip chip-warn" };
    return { text: estado || "—", className: "chip" };
  };

  // Abrir formulario
  const handleOpenForm = (formulario) => {
    const ruta =
      formulario.Formulario?.tipo === "Encuesta"
        ? `/empleado/encuestas/${formulario.codigo_formulario}`
        : `/empleado/cuestionarios/${formulario.codigo_formulario}`;
    navigate(ruta);
  };

  // Auth/me
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data?.mustChangePassword) {
          setMustChangePassword(true);
          setCorreo(data?.correo || "");
        }
      })
      .catch(() => {});
  }, [token, API_URL]);

  // Asignaciones
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/empleado/asignaciones`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setFormularios(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token, API_URL]);

  // Filtro + búsqueda + orden
  const dataFiltrada = useMemo(() => {
    let d =
      filtro === "pendientes"
        ? formularios.filter((f) => f.estado !== "completado")
        : formularios.filter((f) => f.estado === "completado");

    if (q.trim()) {
      const ql = q.toLowerCase();
      d = d.filter((f) => (f.Formulario?.titulo || "").toLowerCase().includes(ql));
    }

    d = [...d].sort((a, b) => {
      if (sort === "titulo")
        return (a.Formulario?.titulo || "").localeCompare(b.Formulario?.titulo || "");
      if (sort === "proximoFin") {
        const af = a.Formulario?.fecha_fin ? new Date(a.Formulario.fecha_fin).getTime() : Infinity;
        const bf = b.Formulario?.fecha_fin ? new Date(b.Formulario.fecha_fin).getTime() : Infinity;
        return af - bf;
      }
      const ai = a.Formulario?.fecha_inicio ? new Date(a.Formulario.fecha_inicio).getTime() : 0;
      const bi = b.Formulario?.fecha_inicio ? new Date(b.Formulario.fecha_inicio).getTime() : 0;
      return bi - ai || (a.Formulario?.titulo || "").localeCompare(b.Formulario?.titulo || "");
    });

    return d;
  }, [formularios, filtro, q, sort]);

  // Reset de página cuando cambian filtros
  useEffect(() => setPage(1), [filtro, q, sort]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(dataFiltrada.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return dataFiltrada.slice(start, start + pageSize);
  }, [dataFiltrada, page]);

  const goTo = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    queueMicrotask(() => {
      if (gridRef.current) gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="emp-shell light vivid plus">
      <Navbar rol={rol} nombre={nombre} />

      {/* Hero */}
      <header className="emp-hero" role="banner" aria-label="Encabezado del panel">
        <div className="emp-hero-text">
          <p className="hello">Hola,</p>
          <h1>
            <span className="name">{nombre}</span>
            <span className="comma">,</span> tu espacio de trabajo
          </h1>
          <p className="subtitle">Gestiona cuestionarios y encuestas asignados en un solo lugar.</p>
        </div>

        {/* KPIs */}
        <section className="emp-kpis" aria-label="Indicadores">
          <div className="kpi-card">
            <div className="kpi-ico">🗂️</div>
            <div className="kpi-content">
              <div className="kpi-value">{formularios.filter((f) => f.estado !== "completado").length}</div>
              <div className="kpi-label">Pendientes</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-ico">✔️</div>
            <div className="kpi-content">
              <div className="kpi-value">{formularios.filter((f) => f.estado === "completado").length}</div>
              <div className="kpi-label">Completados</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-ico">📋</div>
            <div className="kpi-content">
              <div className="kpi-value">{formularios.length}</div>
              <div className="kpi-label">Total asignados</div>
            </div>
          </div>
        </section>
      </header>

      {/* Main */}
      <main className={`emp-main ${density === "compact" ? "density-compact" : ""}`} role="main">
        {/* Toolbar */}
        <div className="toolbar sticky">
          <div className="tabs" role="tablist" aria-label="Filtro de estado">
            <button
              role="tab"
              aria-selected={filtro === "pendientes"}
              className={`tab ${filtro === "pendientes" ? "is-active" : ""}`}
              onClick={() => setFiltro("pendientes")}
            >
              📋 Pendientes
            </button>
            <button
              role="tab"
              aria-selected={filtro === "completados"}
              className={`tab ${filtro === "completados" ? "is-active" : ""}`}
              onClick={() => setFiltro("completados")}
            >
              ✅ Completados
            </button>
          </div>

          <div className="actions">
            <div className="search">
              <input
                type="search"
                placeholder="Buscar por título…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Buscar por título"
              />
              <span className="search-ico">⌕</span>
            </div>

            <label className="sort">
              <span>Ordenar:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recientes">Más recientes</option>
                <option value="proximoFin">Próximo a finalizar</option>
                <option value="titulo">Título (A–Z)</option>
              </select>
            </label>

            <div className="density">
              <button
                className={`dens-btn ${density === "comfortable" ? "on" : ""}`}
                onClick={() => setDensity("comfortable")}
                title="Vista cómoda"
                aria-label="Densidad cómoda"
              >
                Cómodo
              </button>
              <button
                className={`dens-btn ${density === "compact" ? "on" : ""}`}
                onClick={() => setDensity("compact")}
                title="Vista compacta"
                aria-label="Densidad compacta"
              >
                Compacto
              </button>
            </div>
          </div>
        </div>

        {/* Grid + paginación */}
        {dataFiltrada.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">🗂️</div>
            <h3>Sin resultados</h3>
            <p>{filtro === "pendientes" ? "No tienes formularios pendientes." : "No hay formularios completados."}</p>
          </div>
        ) : (
          <>
            <section ref={gridRef} className="grid" aria-label="Lista de formularios">
              {paginated.map((f) => {
                const finETA = timeLeft(f.Formulario?.fecha_fin);
                const chip = estadoChip(f.estado);
                const { pct, tone } = progressFor(f.Formulario?.fecha_inicio, f.Formulario?.fecha_fin);

                return (
                  <article key={f.codigo_formulario} className="card pro">
                    <header className="card-hd">
                      <span className={chip.className}>{chip.text}</span>
                      {f.Formulario?.tipo && <span className="pill">{f.Formulario.tipo}</span>}
                    </header>

                    <h2 className="card-title">{f.Formulario?.titulo || "Sin título"}</h2>

                    <ul className="meta">
                      <li>
                        <strong>Estado formulario:</strong> {f.Formulario?.estatus || "—"}
                      </li>
                      <li>
                        <strong>Tiempo límite:</strong> {minutesLabel(f.Formulario?.tiempo_limite)}
                      </li>
                      <li>
                        <strong>Inicio:</strong> {toDateStr(f.Formulario?.fecha_inicio)}
                      </li>
                      <li>
                        <strong>Fin:</strong> {toDateStr(f.Formulario?.fecha_fin)}
                        {finETA && finETA !== "Finalizó" && <span className="eta"> • vence en {finETA}</span>}
                      </li>
                    </ul>

                    {pct !== null && (
                      <div className={`progress ${tone}`} aria-label="Progreso hacia la fecha fin">
                        <div className="bar" style={{ width: `${pct}%` }} />
                        <span className="pct">{Math.round(pct)}%</span>
                      </div>
                    )}

                    <footer className="card-ft">
                      {f.estado !== "completado" ? (
                        <button
                          className="btn primary"
                          onClick={() => setSelectedForm(f)} // ✅ abre modal
                          aria-label={`Resolver ${f.Formulario?.titulo || ""}`}
                        >
                          Resolver
                        </button>
                      ) : (
                        <span className="done-msg">✔ Respondido</span>
                      )}
                    </footer>
                  </article>
                );
              })}
            </section>

            <nav className="pagination" aria-label="Paginación">
              <button onClick={() => goTo(page - 1)} disabled={page <= 1}>
                Anterior
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button onClick={() => goTo(page + 1)} disabled={page >= totalPages}>
                Siguiente
              </button>
            </nav>
          </>
        )}
      </main>

      {/* Modal confirmación */}
      {selectedForm && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <h5 className="modal-title">⚠️ Confirmación</h5>
              <p>
                Estás a punto de resolver el formulario{" "}
                <strong>{selectedForm.Formulario?.titulo}</strong>.<br />
                ¿Deseas abrirlo ahora?
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={() => setSelectedForm(null)}>
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handleOpenForm(selectedForm);
                    setSelectedForm(null);
                  }}
                >
                  Abrir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal cambio de contraseña */}
      {mustChangePassword && (
        <ChangePasswordModal onClose={() => setMustChangePassword(false)} correo={correo} />
      )}
    </div>
  );
}
