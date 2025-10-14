// src/pages/admin/GestionSeccionesCuestionario.jsx
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../GestionSecciones.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Helpers
const parseOptions = (txt) =>
  (txt || "").split(";").map((s) => s.trim()).filter(Boolean);
const joinOptions = (arr) =>
  (arr || []).map((s) => String(s).trim()).filter(Boolean).join(";");

// Normaliza respuesta_correcta vs. opciones (acepta índice o texto)
function normalizeRespuestaCorrecta(rc, opciones = []) {
  if (rc === null || rc === undefined) return "";
  const rcStr = String(rc).trim();
  const idx = Number(rcStr);
  if (!Number.isNaN(idx) && Number.isInteger(idx) && idx >= 0 && idx < opciones.length) {
    return String(opciones[idx]);
  }
  return rcStr;
}

// Chips
function Chips({ items, onRemove }) {
  if (!items?.length) return null;
  return (
    <div className="gs2-chips">
      {items.map((opt, i) => (
        <span key={i} className="gs2-chip">
          {opt}
          {onRemove && (
            <button
              className="x"
              type="button"
              onClick={() => onRemove(i)}
              aria-label="Quitar"
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

/* =======================
   FORM REUTILIZABLE (Memo)
   ======================= */
const PreguntaForm = memo(function PreguntaForm({
  data,
  q,
  setQ,
  optInput,
  setOptInput,
}) {
  const handleChange = useCallback(
    (field) => (e) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setQ((prev) => ({ ...prev, [field]: value }));
    },
    [setQ]
  );

  const addOption = useCallback(() => {
    const v = (optInput || "").trim();
    if (!v) return;
    setQ((prev) => ({ ...prev, opciones: [...(prev.opciones || []), v] }));
    setOptInput("");
  }, [optInput, setOptInput, setQ]);

  const removeOption = useCallback(
    (i) => {
      setQ((prev) => {
        const nextOps = (prev.opciones || []).filter((_, x) => x !== i);
        const removed = (prev.opciones || [])[i];
        return {
          ...prev,
          opciones: nextOps,
          respuesta_correcta: prev.respuesta_correcta === removed ? "" : prev.respuesta_correcta,
        };
      });
    },
    [setQ]
  );

  const setTipo = useCallback(
    (tipo) => {
      setQ((prev) => ({
        ...prev,
        tipo_pregunta: tipo,
        opciones: [],
        respuesta_correcta: "",
      }));
      setOptInput("");
    },
    [setQ, setOptInput]
  );

  const requiereOpciones =
    q.tipo_pregunta === "opcion_multiple" ||
    q.tipo_pregunta === "seleccion_unica";

  return (
    <>
      <div className="gs2-grid">
        <div className="gs2-form-row">
          <label>Sección</label>
          <select
            className="gs2-input"
            value={q.id_seccion}
            onChange={handleChange("id_seccion")}
          >
            <option value="">-- Selecciona sección --</option>
            {data?.Secciones?.map((s) => (
              <option key={s.id_seccion} value={s.id_seccion}>
                {s.nombre_seccion}
              </option>
            ))}
          </select>
        </div>

        <div className="gs2-form-row">
          <label>Enunciado</label>
          <input
            className="gs2-input"
            placeholder="Escribe la pregunta…"
            autoComplete="off"
            value={q.enunciado ?? ""}
            onChange={handleChange("enunciado")}
          />
        </div>
      </div>

      <div className="gs2-grid">
        <div className="gs2-form-row">
          <label>Tipo de respuesta</label>
          <div className="gs2-segmented">
            {[
              ["respuesta_corta", "Corta"],
              ["si_no", "Sí/No"],
              ["seleccion_unica", "Única"],
              ["opcion_multiple", "Múltiple"],
              ["escala_1_5", "Escala 1–5"],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                className={"gs2-seg-item " + (q.tipo_pregunta === val ? "active" : "")}
                onClick={() => setTipo(val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="gs2-form-row">
          <label>Puntaje</label>
          <input
            type="number"
            min="0"
            max="10"
            className="gs2-input"
            value={q.puntaje ?? 0}
            onChange={handleChange("puntaje")}
          />
        </div>

        <div className="gs2-form-row">
          <label>Obligatoria</label>
          <button
            type="button"
            role="switch"
            aria-checked={!!q.obligatoria}
            onClick={() =>
              setQ((prev) => ({ ...prev, obligatoria: !prev.obligatoria }))
            }
            className={"gs2-switch " + (q.obligatoria ? "on" : "off")}
          >
            <span className="knob" />
          </button>
        </div>
      </div>

      {/* Respuesta según tipo */}
      {q.tipo_pregunta === "respuesta_corta" && (
        <div className="gs2-form-row">
          <label>Respuesta correcta</label>
          <input
            className="gs2-input"
            placeholder="Respuesta"
            value={q.respuesta_correcta ?? ""}
            onChange={handleChange("respuesta_correcta")}
          />
        </div>
      )}

      {q.tipo_pregunta === "si_no" && (
        <div className="gs2-form-row">
          <label>Respuesta correcta</label>
          <select
            className="gs2-input"
            value={String(q.respuesta_correcta ?? "")}
            onChange={handleChange("respuesta_correcta")}
          >
            <option value="">-- Selecciona --</option>
            <option value="Sí">Sí</option>
            <option value="No">No</option>
          </select>
        </div>
      )}

      {requiereOpciones && (
        <div className="gs2-block">
          <details className="gs2-details" open>
            <summary>Opciones</summary>
            <div className="gs2-inline">
              <input
                className="gs2-input flex-1"
                placeholder="Escribe una opción…"
                value={optInput}
                onChange={(e) => setOptInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addOption()}
              />
              <button
                type="button"
                className="gs2-btn gs2-btn-ghost"
                onClick={addOption}
              >
                Añadir
              </button>
            </div>

            <Chips items={q.opciones} onRemove={removeOption} />

            <div className="gs2-form-row">
              <label>Respuesta correcta</label>
              <select
                className="gs2-input"
                value={String(q.respuesta_correcta ?? "")}
                onChange={handleChange("respuesta_correcta")}
              >
                <option value="">-- Respuesta correcta --</option>
                {(q.opciones || []).map((o, i) => (
                  <option key={i} value={String(o)}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </details>
        </div>
      )}

      {q.tipo_pregunta === "escala_1_5" && (
        <div className="gs2-form-row">
          <label>Respuesta correcta (opcional)</label>
          <select
            className="gs2-input"
            value={String(q.respuesta_correcta ?? "")}
            onChange={handleChange("respuesta_correcta")}
          >
            <option value="">(sin asignar)</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
});

/* =======================
   COMPONENTE PRINCIPAL
   ======================= */
export default function GestionSeccionesCuestionario() {
  const { codigo } = useParams();

  const [data, setData] = useState(null);
  const [mobileTab, setMobileTab] = useState("preguntas");

  // sección nueva
  const [secNombre, setSecNombre] = useState("");

  // editor nueva pregunta
  const [newQ, setNewQ] = useState({
    id_seccion: "",
    enunciado: "",
    tipo_pregunta: "respuesta_corta",
    obligatoria: false,
    puntaje: 0,
    opciones: [],
    respuesta_correcta: "",
  });
  const [optInput, setOptInput] = useState("");

  // edición
  const [editSeccion, setEditSeccion] = useState(null);
  const [editPregunta, setEditPregunta] = useState(null);
  const [optEditInput, setOptEditInput] = useState("");

  // selección/filtrado
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("");
  const [filtro, setFiltro] = useState("");
  const [buscarSec, setBuscarSec] = useState("");

  const token = useMemo(() => localStorage.getItem("token"), []);

  // ======== Data ========
const fetchPreview = useCallback(async () => {
  const res = await fetch(`${API}/admin/cuestionarios/${codigo}/preview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    const json = await res.json();
    setData(json);
  }
}, [codigo, token]);

useEffect(() => {
  fetchPreview();
}, [fetchPreview]);

useEffect(() => {
  if (!seccionSeleccionada && data?.Secciones?.length) {
    setSeccionSeleccionada(String(data.Secciones[0].id_seccion));
  }
}, [data, seccionSeleccionada]);


  const selectedSection = data?.Secciones?.find(
    (s) => String(s.id_seccion) === String(seccionSeleccionada)
  );

  const preguntasFiltradas = (selectedSection?.Preguntas || []).filter((p) =>
    (p.enunciado || "").toLowerCase().includes(filtro.toLowerCase())
  );

  const totalSecciones = data?.Secciones?.length || 0;
  const totalPreguntas =
    data?.Secciones?.reduce(
      (acc, s) => acc + (s.Preguntas?.length || 0),
      0
    ) || 0;

  // ======== Acciones Sección ========
const crearSeccion = async () => {
  if (!secNombre.trim()) return alert("Ingrese nombre de la sección");

  const res = await fetch(`${API}/admin/cuestionarios/secciones`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      codigo_formulario: codigo,
      nombre_seccion: secNombre,
    }),
  });

  if (!res.ok) return;

  let created = null;
  try { created = await res.json(); } catch {}

  setSecNombre("");
  await fetchPreview();

  if (created?.id_seccion) {
    setSeccionSeleccionada(String(created.id_seccion));
  } else if (data?.Secciones?.length) {
    const all = [...(data.Secciones || [])];
    const last = all.sort((a, b) => b.id_seccion - a.id_seccion)[0];
    if (last) setSeccionSeleccionada(String(last.id_seccion));
  }
};


  const eliminarSeccion = async (id) => {
    if (!confirm("¿Eliminar sección y sus preguntas?")) return;
    const res = await fetch(`${API}/admin/cuestionarios/secciones/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      if (String(id) === String(seccionSeleccionada))
        setSeccionSeleccionada("");
      await fetchPreview();
    }
  };

  const guardarSeccionEditada = async () => {
    const res = await fetch(
      `${API}/admin/cuestionarios/secciones/${editSeccion.id_seccion}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre_seccion: editSeccion.nombre_seccion,
        }),
      }
    );
    if (res.ok) {
      setEditSeccion(null);
      fetchPreview();
    }
  };

  // ======== Acciones Pregunta ========
  const resetNuevaPregunta = () => {
    setNewQ({
      id_seccion: "",
      enunciado: "",
      tipo_pregunta: "respuesta_corta",
      obligatoria: false,
      puntaje: 0,
      opciones: [],
      respuesta_correcta: "",
    });
    setOptInput("");
  };

  // Asegura que la RC exista en opciones para tipos que usan opciones
  function ensureRCInOptions(q) {
    if (
      q.tipo_pregunta === "seleccion_unica" ||
      q.tipo_pregunta === "opcion_multiple"
    ) {
      const rcNorm = normalizeRespuestaCorrecta(q.respuesta_correcta, q.opciones || []);
      if (!rcNorm || !(q.opciones || []).map(String).includes(String(rcNorm))) {
        return { ...q, respuesta_correcta: "" };
      }
      return { ...q, respuesta_correcta: String(rcNorm) };
    }
    return q;
  }

  const crearPregunta = async () => {
    let q = { ...newQ, opciones: [...(newQ.opciones || [])].map(String) };
    q = ensureRCInOptions(q);

    if (!q.id_seccion) return alert("Seleccione una sección");
    if (!q.enunciado.trim()) return alert("Ingrese enunciado");
    if (q.tipo_pregunta !== "escala_1_5" && !q.respuesta_correcta)
      return alert("Debe definir una respuesta correcta");

    const payload = {
      ...q,
      opciones: joinOptions(q.opciones),
      id_seccion: Number(q.id_seccion),
    };
    const res = await fetch(`${API}/admin/cuestionarios/preguntas`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      resetNuevaPregunta();
      fetchPreview();
    }
  };

  const eliminarPregunta = async (id) => {
    if (!confirm("¿Eliminar pregunta?")) return;
    const res = await fetch(`${API}/admin/cuestionarios/preguntas/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchPreview();
  };

  const guardarPreguntaEditada = async () => {
    let q = {
      ...editPregunta,
      opciones: [...(editPregunta.opciones || [])].map(String),
    };
    q = ensureRCInOptions(q);

    const payload = {
      ...q,
      opciones: joinOptions(q.opciones || []),
      respuesta_correcta: String(q.respuesta_correcta ?? ""),
    };

    const res = await fetch(
      `${API}/admin/cuestionarios/preguntas/${editPregunta.id_pregunta}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    if (res.ok) {
      setEditPregunta(null);
      fetchPreview();
    }
  };

  if (!data) return <div className="gs2-loading">Cargando cuestionario…</div>;

  return (
    <div className="gs2-root">
      <Navbar rol="admin" nombre={localStorage.getItem("nombre") || "Admin"} />

      {/* Toolbar */}
      <div className="gs2-toolbar">


        <div className="gs2-title">
          <span className="gs2-dot" />
          Gestión de Cuestionario
          <span className="gs2-code">Código: {codigo}</span>
        </div>

        <div className="gs2-kpis">
          <div className="gs2-kpi">
            <div className="kpi-label">Secciones</div>
            <div className="kpi-value">{totalSecciones}</div>
          </div>
          <div className="gs2-kpi">
            <div className="kpi-label">Preguntas</div>
            <div className="kpi-value">{totalPreguntas}</div>
          </div>
          {selectedSection && (
            <div className="gs2-kpi hide-sm">
              <div className="kpi-label">Seleccionada</div>
              <div className="kpi-value">
                {selectedSection.nombre_seccion}
              </div>
            </div>
          )}
        </div>
      </div>

      
      {/* Contenido 3 paneles */}
      <div className="gs2-content" data-mobile-tab={mobileTab}>
        {/* Panel izquierdo: Secciones */}
        <aside className="gs2-pane pane-left">
          <div className="gs2-pane-header">
            <div className="gs2-pane-title">Secciones</div>
            <input
              className="gs2-input"
              placeholder="Buscar sección…"
              value={buscarSec}
              onChange={(e) => setBuscarSec(e.target.value)}
            />
          </div>

          <div className="gs2-pane-body">
            <ul className="gs2-list">
              {data.Secciones?.filter((s) =>
                (s.nombre_seccion || "")
                  .toLowerCase()
                  .includes(buscarSec.toLowerCase())
              ).map((s) => {
                const active =
                  String(s.id_seccion) === String(seccionSeleccionada);
                return (
<li
  key={s.id_seccion}
  className={"gs2-list-item " + (active ? "active" : "")}
  onClick={() => {
    setSeccionSeleccionada(String(s.id_seccion));
    setMobileTab("preguntas");
  }}
>
  <div className="gs2-list-text">
    <div className="gs2-list-title">{s.nombre_seccion}</div>
    <div className="gs2-list-sub">
      {s.Preguntas?.length || 0} pregunta(s)
    </div>
  </div>

<div className="gs2-inline">
  <button
    type="button"
    className="gs2-icon"
    title="Editar sección"
    onClick={(e) => {
      e.stopPropagation();
      setEditSeccion({
        id_seccion: s.id_seccion,
        nombre_seccion: s.nombre_seccion || "",
      });
    }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
            stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>

  <button
    type="button"
    className="gs2-icon danger"
    title="Eliminar"
    onClick={(e) => {
      e.stopPropagation();
      eliminarSeccion(s.id_seccion);
    }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M9 6v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
            stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  </button>
</div>

</li>

                );
              })}
              {!data.Secciones?.length && (
                <li className="gs2-empty">Aún no hay secciones</li>
              )}
            </ul>
          </div>

          <div className="gs2-pane-footer">
            <div className="gs2-form-row">
              <label>Nombre de la nueva sección</label>
              <input
                className="gs2-input"
                placeholder="Ej. Cultura General"
                value={secNombre}
                onChange={(e) => setSecNombre(e.target.value)}
              />
            </div>
            <button
              className="gs2-btn gs2-btn-primary w-100"
              onClick={crearSeccion}
              disabled={!secNombre.trim()}
            >
              ➕ Crear sección
            </button>
          </div>
        </aside>

        {/* Panel central: Preguntas */}
        <section className="gs2-pane pane-middle">
          <div className="gs2-pane-header">
            <div className="gs2-pane-title">
              {selectedSection
                ? `Preguntas · ${selectedSection.nombre_seccion}`
                : "Preguntas"}
            </div>
          </div>

          <div className="gs2-pane-body">
            {!selectedSection ? (
              <div className="gs2-empty">Selecciona una sección.</div>
            ) : (selectedSection.Preguntas?.length || 0) > 0 ? (
              <>
                <div className="gs2-form-row">
                  <input
                    className="gs2-input"
                    placeholder="Buscar pregunta…"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  />
                </div>
                <ul className="gs2-questions">
                  {preguntasFiltradas.map((p) => {
                    const opciones = parseOptions(p.opciones || "");
                    const rcNorm = normalizeRespuestaCorrecta(p.respuesta_correcta, opciones);
                    return (
                      <li key={p.id_pregunta} className="gs2-q">
                        <div>
                          <div className="gs2-q-title">{p.enunciado}</div>
                          <div className="gs2-q-meta">
                            <span className="gs2-tag">{p.tipo_pregunta}</span>
                            {p.obligatoria && (
                              <span className="gs2-tag warn">obligatoria</span>
                            )}
                            <span className="gs2-tag">
                              puntaje {p.puntaje ?? 0}
                            </span>
                            {rcNorm && (
                              <span className="gs2-tag">
                                correcta: {rcNorm}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="gs2-inline">
                          <button
                            className="gs2-icon"
                            title="Editar"
                            onClick={() =>
                              setEditPregunta({
                                ...p,
                                opciones,
                                enunciado: p.enunciado || "",
                                tipo_pregunta: p.tipo_pregunta || "respuesta_corta",
                                puntaje: p.puntaje ?? 0,
                                obligatoria: !!p.obligatoria,
                                respuesta_correcta: rcNorm,
                                id_seccion: p.id_seccion,
                              })
                            }
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 20h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            className="gs2-icon danger"
                            title="Eliminar"
                            onClick={() => eliminarPregunta(p.id_pregunta)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M3 6h18M9 6v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="gs2-empty">Sin resultados</div>
            )}
          </div>
        </section>

        {/* Panel derecho: Editor nueva pregunta */}
        <section className="gs2-pane pane-right">
          <div className="gs2-pane-header">
            <div className="gs2-pane-title">Añadir Pregunta</div>
          </div>

          <div className="gs2-pane-body">
            <PreguntaForm
              data={data}
              q={newQ}
              setQ={setNewQ}
              optInput={optInput}
              setOptInput={setOptInput}
            />
          </div>

          <div className="gs2-pane-footer">
            <button
              className="gs2-btn gs2-btn-success w-100"
              onClick={crearPregunta}
            >
              Crear Pregunta
            </button>
          </div>
        </section>
      </div>

      {/* ===== Modales ===== */}
      {editSeccion && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "#0003" }}>
          <div className="modal-dialog">
            <div className="modal-content p-4">
              <h5>Editar sección</h5>
              <input
                className="gs2-input"
                value={editSeccion.nombre_seccion}
                onChange={(e) =>
                  setEditSeccion({
                    ...editSeccion,
                    nombre_seccion: e.target.value,
                  })
                }
              />
              <div className="mt-3" style={{ textAlign: "end" }}>
                <button
                  className="gs2-btn gs2-btn-ghost"
                  onClick={() => setEditSeccion(null)}
                >
                  Cancelar
                </button>
                <button
                  className="gs2-btn gs2-btn-primary"
                  onClick={guardarSeccionEditada}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editPregunta && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "#0003" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-4">
              <h5>Editar pregunta</h5>
              <PreguntaForm
                data={data}
                q={editPregunta}
                setQ={setEditPregunta}
                optInput={optEditInput}
                setOptInput={setOptEditInput}
              />
              <div className="mt-3" style={{ textAlign: "end" }}>
                <button
                  className="gs2-btn gs2-btn-ghost"
                  onClick={() => setEditPregunta(null)}
                >
                  Cancelar
                </button>
                <button
                  className="gs2-btn gs2-btn-primary"
                  onClick={guardarPreguntaEditada}
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
