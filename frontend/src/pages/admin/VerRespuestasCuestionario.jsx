// src/pages/admin/VerRespuestasCuestionario.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../css/VerRespuestaCuestionario.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const PAGE_SIZE = 5; // 👈 tamaño de página

export default function VerRespuestasCuestionario() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);

  // UI state
  const [q, setQ] = useState("");
  const [orden, setOrden] = useState("fecha_desc"); // fecha_desc | fecha_asc | puntaje_desc | puntaje_asc | nombre
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/admin/cuestionarios/${codigo}/respuestas`, {
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
    fetch(`${API_URL}/admin/cuestionarios/${codigo}/respuestas?usuario=${id_usuario}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setDetalle(data))
      .catch((err) => console.error("Error cargando detalle:", err));
  };

  const cerrarDetalle = () => setDetalle(null);

  // Filtrado + orden
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

    const byPuntaje = (a, b) => (a.puntaje_total || 0) - (b.puntaje_total || 0);

    switch (orden) {
      case "fecha_asc":
        arr.sort(byFecha);
        break;
      case "fecha_desc":
        arr.sort((a, b) => -byFecha(a, b));
        break;
      case "puntaje_asc":
        arr.sort(byPuntaje);
        break;
      case "puntaje_desc":
        arr.sort((a, b) => -byPuntaje(a, b));
        break;
      case "nombre":
        arr.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
        break;
      default:
        break;
    }
    return arr;
  }, [empleados, q, orden]);

  // Reset de página si cambian filtros/orden
  useEffect(() => {
    setPage(1);
  }, [q, orden]);

  // Paginación (después del filtrado/orden)
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
      <Navbar rol="admin" nombre={localStorage.getItem("nombre") || "Admin"} />

      <div className="vr-container">
        <div className="vr-header">
          <div>
            <h1 className="vr-title">Respuestas del Cuestionario</h1>
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
              <path
                fill="currentColor"
                d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              />
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
              <option value="puntaje_desc">Puntaje ↓</option>
              <option value="puntaje_asc">Puntaje ↑</option>
              <option value="nombre">Nombre A–Z</option>
            </select>
          </div>
        </div>

        {/* Tabla / lista responsiva */}
        {loading ? (
          <div className="vr-skeleton">
            <div className="line" />
            <div className="line" />
            <div className="line" />
          </div>
        ) : pagina.length === 0 ? (
          <div className="vr-empty">No hay coincidencias.</div>
        ) : (
          <>
            <div className="vr-table-wrap">
              <table className="vr-table">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th>Puntaje</th>
                    <th>Fecha</th>
                    <th className="center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagina.map((emp) => (
                    <tr key={emp.id_usuario}>
                      <td className="cell-emp">
                        <div className="avatar">{(emp.nombre || "E")[0]}</div>
                        <div className="emp-texts">
                          <div className="emp-name">{emp.nombre || "—"}</div>
                          <div className="emp-sub">{emp.id_usuario}</div>
                        </div>
                      </td>
                      <td className="mono">{emp.correo || "—"}</td>
                      <td>
                        <span
                          className={`vr-badge ${
                            emp.estado === "completado"
                              ? "ok"
                              : emp.estado === "pendiente"
                              ? "warn"
                              : "muted"
                          }`}
                        >
                          {emp.estado || "—"}
                        </span>
                      </td>
                      <td>
                        <div className="score">
                          <span className="score-num">{emp.puntaje_total ?? 0} pts</span>
                          {typeof emp.porcentaje === "number" && (
                            <span className="score-mini">{emp.porcentaje.toFixed(0)}%</span>
                          )}
                        </div>
                      </td>
                      <td className="mono">
                        {emp.fecha_respuesta
                          ? new Date(emp.fecha_respuesta).toLocaleString()
                          : "—"}
                      </td>
                      <td className="center">
                        {emp.estado === "completado" ? (
                          <button
                            className="vr-btn vr-btn-primary vr-btn-sm"
                            onClick={() => verDetalle(emp.id_usuario)}
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
                <button
                  className="vr-btn vr-btn-secondary vr-btn-sm"
                  onClick={() => goTo(1)}
                  disabled={safePage === 1}
                  aria-label="Primera página"
                >
                  «
                </button>
                <button
                  className="vr-btn vr-btn-secondary vr-btn-sm"
                  onClick={prev}
                  disabled={safePage === 1}
                  aria-label="Página anterior"
                >
                  ‹
                </button>

                {/* Números (máx 5 visibles) */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    const window = 2; // lados visibles
                    return (
                      p === 1 ||
                      p === totalPages ||
                      (p >= safePage - window && p <= safePage + window)
                    );
                  })
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const needDots = prevP && p - prevP > 1;
                    return (
                      <span key={p} className="vr-pager-item">
                        {needDots && <span className="vr-pager-dots">…</span>}
                        <button
                          className={`vr-btn vr-btn-sm ${
                            p === safePage ? "vr-btn-primary" : "vr-btn-secondary"
                          }`}
                          onClick={() => goTo(p)}
                          aria-current={p === safePage ? "page" : undefined}
                        >
                          {p}
                        </button>
                      </span>
                    );
                  })}

                <button
                  className="vr-btn vr-btn-secondary vr-btn-sm"
                  onClick={next}
                  disabled={safePage === totalPages}
                  aria-label="Página siguiente"
                >
                  ›
                </button>
                <button
                  className="vr-btn vr-btn-secondary vr-btn-sm"
                  onClick={() => goTo(totalPages)}
                  disabled={safePage === totalPages}
                  aria-label="Última página"
                >
                  »
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modal Detalle */}
        {detalle && (
          <div
            className="vr-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target.classList.contains("vr-modal")) cerrarDetalle();
            }}
          >
            <div className="vr-modal-card" role="document">
              <div className="vr-modal-head">
                <div>
                  <h3 className="vr-modal-title">
                    Respuestas de {detalle.empleado?.nombre} ({detalle.empleado?.correo})
                  </h3>
                  <div className="vr-modal-meta">
                    <strong>Puntaje Total:</strong> {detalle.puntajeTotal} pts ·{" "}
                    <strong>Estado:</strong>{" "}
                    <span className={detalle.aprobado ? "text-ok" : "text-ko"}>
                      {detalle.aprobado ? "✓ Aprobado" : "✗ Reprobado"}
                    </span>
                  </div>
                </div>
                <button
                  className="vr-btn vr-btn-ghost"
                  onClick={cerrarDetalle}
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>

              <div className="vr-modal-body">
                <div className="vr-table-wrap compact">
                  <table className="vr-table">
                    <thead>
                      <tr>
                        <th style={{ width: "45%" }}>Pregunta</th>
                        <th>Respuesta</th>
                        <th className="center">Correcta</th>
                        <th className="right">Puntaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detalle.respuestas || []).map((r) => (
                        <tr key={r.id_pregunta}>
                          <td>{r.pregunta}</td>
                          <td className="mono">{r.respuesta}</td>
                          <td className="center">
                            {r.es_correcta !== null ? (
                              <span className={`vr-badge ${r.es_correcta ? "ok" : "ko"}`}>
                                {r.es_correcta ? "Correcta" : "Incorrecta"}
                              </span>
                            ) : (
                              <span className="vr-muted">—</span>
                            )}
                          </td>
                          <td className="right mono">
                            {r.puntaje_obtenido} / {r.puntaje_total} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="vr-modal-foot">
                <button className="vr-btn vr-btn-secondary" onClick={cerrarDetalle}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
