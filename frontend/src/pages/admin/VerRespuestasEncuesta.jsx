// src/pages/admin/VerRespuestasEncuesta.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
// Reusamos los estilos 'vr-*' (mismo archivo que el de cuestionarios)
import "../../css/VerRespuestaCuestionario.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const PAGE_SIZE = 5;

export default function VerRespuestasEncuesta() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);

  // Toolbar UI
  const [q, setQ] = useState("");
  const [orden, setOrden] = useState("fecha_desc"); // fecha_desc | fecha_asc | nombre
  const [page, setPage] = useState(1);

  // Cargar lista
  useEffect(() => {
    fetch(`${API_URL}/admin/encuestas/${codigo}/respuestas`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setEmpleados(data.empleados || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando empleados:", err);
        setLoading(false);
      });
  }, [codigo, token]);

  const verDetalle = (id_usuario) => {
    fetch(`${API_URL}/admin/encuestas/${codigo}/respuestas?usuario=${id_usuario}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((info) => setDetalle(info))
      .catch((err) => console.error("Error cargando detalle:", err));
  };

  const cerrarDetalle = () => setDetalle(null);

  // ---- Filtro + Orden
  const listaFiltradaOrdenada = useMemo(() => {
    const txt = q.trim().toLowerCase();
    let arr = [...empleados].filter((e) => {
      if (!txt) return true;
      return (
        e?.nombre?.toLowerCase().includes(txt) ||
        e?.correo?.toLowerCase().includes(txt) ||
        e?.estado?.toLowerCase().includes(txt)
      );
    });

    const byFecha = (a, b) =>
      (new Date(a.fecha_respuesta || 0).getTime() || 0) -
      (new Date(b.fecha_respuesta || 0).getTime() || 0);

    switch (orden) {
      case "fecha_asc":
        arr.sort(byFecha);
        break;
      case "fecha_desc":
        arr.sort((a, b) => -byFecha(a, b));
        break;
      case "nombre":
        arr.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
        break;
      default:
        break;
    }
    return arr;
  }, [empleados, q, orden]);

  // Reset página cuando cambian búsqueda/orden
  useEffect(() => { setPage(1); }, [q, orden]);

  // ---- Paginación
  const totalItems = listaFiltradaOrdenada.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pagina = listaFiltradaOrdenada.slice(start, end);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));
  const prev = () => goTo(safePage - 1);
  const next = () => goTo(safePage + 1);

  return (
    <div className="vr-shell">
      <Navbar rol="admin" nombre={localStorage.getItem("nombre") || "Administrador"} />

      <div className="vr-container">
        <div className="vr-header">
          <div>
            <h1 className="vr-title">Respuestas de la encuesta</h1>
            <p className="vr-subtitle">{codigo}</p>
          </div>
          <div className="vr-actions">
            <button className="vr-btn vr-btn-secondary" onClick={() => navigate(-1)}>
              ← Volver
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="vr-toolbar">
          <div className="vr-search">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              placeholder="Buscar por nombre, correo o estado…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="vr-filter">
            <label>Ordenar:</label>
            <select value={orden} onChange={(e) => setOrden(e.target.value)}>
              <option value="fecha_desc">Fecha ↓</option>
              <option value="fecha_asc">Fecha ↑</option>
              <option value="nombre">Nombre A–Z</option>
            </select>
          </div>
        </div>

        {/* Tabla / lista */}
        {loading ? (
          <div className="vr-skeleton">
            <div className="line" /><div className="line" /><div className="line" />
          </div>
        ) : pagina.length === 0 ? (
          <div className="vr-empty">No hay coincidencias.</div>
        ) : (
          <>
            <div className="vr-table-wrap">
              <table className="vr-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Empleado</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th>Fecha respuesta</th>
                    <th className="center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagina.map((e, idx) => (
                    <tr key={e.id_usuario}>
                      <td className="mono">{start + idx + 1}</td>
                      <td className="cell-emp">
                        <div className="avatar">{(e.nombre || "E")[0]}</div>
                        <div className="emp-texts">
                          <div className="emp-name">{e.nombre || "—"}</div>
                          <div className="emp-sub">{e.id_usuario}</div>
                        </div>
                      </td>
                      <td className="mono">{e.correo || "—"}</td>
                      <td>
                        <span
                          className={`vr-badge ${
                            e.estado === "completado"
                              ? "ok"
                              : e.estado === "pendiente"
                              ? "warn"
                              : "muted"
                          }`}
                        >
                          {e.estado || "—"}
                        </span>
                      </td>
                      <td className="mono">
                        {e.fecha_respuesta
                          ? new Date(e.fecha_respuesta).toLocaleString()
                          : "—"}
                      </td>
                      <td className="center">
                        {e.estado === "completado" ? (
                          <button
                            className="vr-btn vr-btn-primary vr-btn-sm"
                            onClick={() => verDetalle(e.id_usuario)}
                          >
                            Ver respuestas
                          </button>
                        ) : (
                          <span className="vr-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="vr-pager">
              <div className="vr-pager-info">
                Mostrando <strong>{start + 1}</strong>–<strong>{Math.min(end, totalItems)}</strong> de{" "}
                <strong>{totalItems}</strong>
              </div>
              <div className="vr-pager-controls">
                <button className="vr-btn vr-btn-secondary vr-btn-sm" onClick={() => goTo(1)} disabled={safePage === 1}>«</button>
                <button className="vr-btn vr-btn-secondary vr-btn-sm" onClick={() => goTo(safePage - 1)} disabled={safePage === 1}>‹</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p, i, arr) => {
                    const window = 2;
                    return p === 1 || p === totalPages || (p >= safePage - window && p <= safePage + window);
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const needDots = prev && p - prev > 1;
                    return (
                      <span key={p} className="vr-pager-item">
                        {needDots && <span className="vr-pager-dots">…</span>}
                        <button
                          className={`vr-btn vr-btn-sm ${p === safePage ? "vr-btn-primary" : "vr-btn-secondary"}`}
                          onClick={() => goTo(p)}
                          aria-current={p === safePage ? "page" : undefined}
                        >
                          {p}
                        </button>
                      </span>
                    );
                  })}

                <button className="vr-btn vr-btn-secondary vr-btn-sm" onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages}>›</button>
                <button className="vr-btn vr-btn-secondary vr-btn-sm" onClick={() => goTo(totalPages)} disabled={safePage === totalPages}>»</button>
              </div>
            </div>
          </>
        )}

        {/* Modal detalle */}
        {detalle && (
          <div
            className="vr-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => { if (e.target.classList.contains("vr-modal")) cerrarDetalle(); }}
          >
            <div className="vr-modal-card" role="document">
              <div className="vr-modal-head">
                <div>
                  <h3 className="vr-modal-title">
                    Respuestas de {detalle.empleado?.nombre} ({detalle.empleado?.correo})
                  </h3>
                </div>
                <button className="vr-btn vr-btn-ghost" onClick={cerrarDetalle} aria-label="Cerrar">✕</button>
              </div>

              <div className="vr-modal-body">
                <div className="vr-table-wrap compact">
                  <table className="vr-table">
                    <thead>
                      <tr>
                        <th style={{width:"55%"}}>Pregunta</th>
                        <th>Respuesta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detalle.respuestas || []).map((r) => (
                        <tr key={r.id_pregunta}>
                          <td>{r.pregunta}</td>
                          <td className="mono">{r.respuesta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="vr-modal-foot">
                <button className="vr-btn vr-btn-secondary" onClick={cerrarDetalle}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
