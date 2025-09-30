import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../GestionSecciones.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function GestionSecciones() {
  const navigate = useNavigate();
  const { codigo } = useParams();

  const [encuesta, setEncuesta] = useState({ codigo, secciones: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // === Sidebar: búsqueda/creación de sección
  const [buscarSec, setBuscarSec] = useState("");
  const [nuevaSeccion, setNuevaSeccion] = useState({
    nombre_seccion: "",
    tema: "",
  });

  // === Selección actual
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("");
  const selectedSection = encuesta.secciones.find(
    (s) => String(s.id_seccion) === String(seccionSeleccionada)
  );

  // === Editor de Pregunta (compacto)
  const [nuevaPregunta, setNuevaPregunta] = useState({
    enunciado: "",
    tipo_pregunta: "respuesta_corta",
    obligatoria: false,
  });

  // Opciones
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  const [opciones, setOpciones] = useState([]);
  const [mostrarPegadoMasivo, setMostrarPegadoMasivo] = useState(false);
  const [bloqueOpciones, setBloqueOpciones] = useState("");

  // Listado preguntas: filtro local
  const [filtro, setFiltro] = useState("");

  const token = localStorage.getItem("token");

  // ==================== Data ====================
  const obtenerDatos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/encuestas/${codigo}/secciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar secciones");
      const data = await res.json();
      setEncuesta({ codigo, secciones: data || [] });
      if (!seccionSeleccionada && data?.length) {
        setSeccionSeleccionada(String(data[0].id_seccion));
      }
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  const totalSecciones = encuesta.secciones.length;
  const totalPreguntas = encuesta.secciones.reduce(
    (acc, s) => acc + (s.Preguntas?.length || 0),
    0
  );

  // ==================== Acciones Sección ====================
  const crearSeccion = async () => {
    if (!nuevaSeccion.nombre_seccion.trim()) return;
    try {
      const res = await fetch(`${API_URL}/admin/encuestas/${codigo}/secciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaSeccion),
      });
      if (!res.ok) throw new Error("No se pudo crear la sección");
      setNuevaSeccion({ nombre_seccion: "", tema: "" });
      await obtenerDatos();
    } catch (e) {
      alert(e.message);
    }
  };

  // ==================== Acciones Pregunta ====================
  const requiereOpciones =
    nuevaPregunta.tipo_pregunta === "opcion_multiple" ||
    nuevaPregunta.tipo_pregunta === "seleccion_unica";

  const puedeCrearPregunta = useMemo(() => {
    if (!seccionSeleccionada) return false;
    if (!nuevaPregunta.enunciado.trim()) return false;
    if (requiereOpciones && opciones.length < 2) return false;
    return true;
  }, [seccionSeleccionada, nuevaPregunta, requiereOpciones, opciones]);

  const crearPregunta = async () => {
    if (!puedeCrearPregunta) return;
    try {
      const payload = {
        ...nuevaPregunta,
        ...(requiereOpciones ? { opciones } : {}),
      };

      const res = await fetch(
        `${API_URL}/admin/encuestas/secciones/${seccionSeleccionada}/preguntas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("No se pudo crear la pregunta");

      // Reset editor
      setNuevaPregunta({
        enunciado: "",
        tipo_pregunta: "respuesta_corta",
        obligatoria: false,
      });
      setOpciones([]);
      setNuevaOpcion("");
      setMostrarPegadoMasivo(false);
      setBloqueOpciones("");
      await obtenerDatos();
    } catch (e) {
      alert(e.message);
    }
  };

  const eliminarPregunta = async (id_pregunta) => {
    const ok = confirm("¿Eliminar esta pregunta? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      // Ruta principal (ajústala si tu backend usa otra)
      let res = await fetch(`${API_URL}/admin/encuestas/preguntas/${id_pregunta}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fallback a una ruta alternativa común:
      if (!res.ok) {
        res = await fetch(
          `${API_URL}/admin/encuestas/secciones/${seccionSeleccionada}/preguntas/${id_pregunta}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (!res.ok) throw new Error("No se pudo eliminar la pregunta.");
      await obtenerDatos();
    } catch (e) {
      alert(e.message);
    }
  };

  // Chips/acciones opciones
  const agregarOpcion = () => {
    const val = (nuevaOpcion || "").trim();
    if (!val) return;
    if (opciones.includes(val)) return;
    setOpciones([...opciones, val]);
    setNuevaOpcion("");
  };
  const eliminarOpcionChip = (i) =>
    setOpciones(opciones.filter((_, idx) => idx !== i));
  const pegarEnBloque = () => {
    const items = (bloqueOpciones || "")
      .split(/[\n,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!items.length) return;
    const nuevos = [...opciones];
    items.forEach((it) => {
      if (!nuevos.includes(it)) nuevos.push(it);
    });
    setOpciones(nuevos);
    setBloqueOpciones("");
    setMostrarPegadoMasivo(false);
  };

  // Listas filtradas
  const seccionesSidebar = (encuesta.secciones || []).filter((s) =>
    (s.nombre_seccion || "").toLowerCase().includes(buscarSec.toLowerCase())
  );
  const preguntasFiltradas = (selectedSection?.Preguntas || []).filter((p) =>
    p.enunciado.toLowerCase().includes(filtro.toLowerCase())
  );

  // ==================== UI ====================
  if (loading) return <div className="gs2-loading">Cargando…</div>;
  if (error) return <div className="gs2-error">❌ {error}</div>;

  return (
    <div className="gs2-root">
      <Navbar rol="admin" nombre={localStorage.getItem("nombre") || "Admin"} />

      {/* ====== TOOLBAR SUPERIOR ====== */}
      <div className="gs2-toolbar">
        <div className="gs2-toolbar-left">
          <button className="gs2-btn gs2-btn-ghost" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <div className="gs2-title">
            <span className="gs2-dot" />
            Gestor de Secciones
          </div>
          <div className="gs2-code">Código: {codigo}</div>
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
          <div className="gs2-kpi hide-sm">
            <div className="kpi-label">Seleccionada</div>
            <div className="kpi-value">
              {selectedSection ? selectedSection.nombre_seccion : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* ====== CONTENIDO 3 COL ====== */}
      <div className="gs2-content">
        {/* === Col 1: Secciones === */}
        <aside className="gs2-pane gs2-left">
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
              {seccionesSidebar.map((s) => {
                const active = String(s.id_seccion) === String(seccionSeleccionada);
                return (
                  <li
                    key={s.id_seccion}
                    className={"gs2-list-item " + (active ? "active" : "")}
                    onClick={() => setSeccionSeleccionada(String(s.id_seccion))}
                  >
                    <div className="gs2-list-text">
                      <div className="gs2-list-title">{s.nombre_seccion}</div>
                      {!!s.tema && <div className="gs2-list-sub">{s.tema}</div>}
                    </div>
                    <div className="gs2-pill">{s.Preguntas?.length || 0}</div>
                  </li>
                );
              })}
              {!seccionesSidebar.length && (
                <li className="gs2-empty">No hay secciones.</li>
              )}
            </ul>
          </div>

          <div className="gs2-pane-footer">
            <div className="gs2-form-row">
              <label>Nombre</label>
              <input
                className="gs2-input"
                value={nuevaSeccion.nombre_seccion}
                onChange={(e) =>
                  setNuevaSeccion({ ...nuevaSeccion, nombre_seccion: e.target.value })
                }
              />
            </div>
            <div className="gs2-form-row">
              <label>Tema</label>
              <input
                className="gs2-input"
                value={nuevaSeccion.tema}
                onChange={(e) => setNuevaSeccion({ ...nuevaSeccion, tema: e.target.value })}
              />
            </div>
            <button
              className="gs2-btn gs2-btn-primary w-100"
              onClick={crearSeccion}
              disabled={!nuevaSeccion.nombre_seccion.trim()}
            >
              ➕ Crear sección
            </button>
          </div>
        </aside>

        {/* === Col 2: Preguntas === */}
        <section className="gs2-pane gs2-middle">
          <div className="gs2-pane-header">
            <div className="gs2-pane-title">
              {selectedSection ? `Preguntas · ${selectedSection.nombre_seccion}` : "Preguntas"}
            </div>
            <input
              className="gs2-input"
              placeholder="Buscar pregunta…"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          <div className="gs2-pane-body">
            {!selectedSection ? (
              <div className="gs2-empty">Selecciona una sección a la izquierda.</div>
            ) : preguntasFiltradas.length ? (
              <ul className="gs2-questions">
                {preguntasFiltradas.map((p) => (
                  <li key={p.id_pregunta} className="gs2-q">
                    <div className="gs2-q-title">{p.enunciado}</div>
                    <div className="gs2-q-meta">
                      <span className="gs2-tag">{p.tipo_pregunta}</span>
                      {p.obligatoria && <span className="gs2-tag warn">obligatoria</span>}
                      <button
                        className="gs2-icon danger"
                        title="Eliminar"
                        aria-label="Eliminar"
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarPregunta(p.id_pregunta);
                        }}
                      >
                        {/* Trash icon */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6h18M9 6v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="gs2-empty">Sin resultados</div>
            )}
          </div>
        </section>

        {/* === Col 3: Editor (compacto) === */}
        <section className="gs2-pane gs2-right">
          <div className="gs2-pane-header">
            <div className="gs2-pane-title">Añadir Pregunta</div>
          </div>

          <div className="gs2-pane-body">
            {/* Fila 1: Sección / Enunciado */}
            <div className="gs2-grid">
              <div className="gs2-form-row">
                <label>Sección</label>
                <select
                  className="gs2-input"
                  value={seccionSeleccionada}
                  onChange={(e) => setSeccionSeleccionada(e.target.value)}
                >
                  <option value="">Selecciona una sección…</option>
                  {(encuesta.secciones || []).map((s) => (
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
                  value={nuevaPregunta.enunciado}
                  onChange={(e) =>
                    setNuevaPregunta({ ...nuevaPregunta, enunciado: e.target.value })
                  }
                  placeholder="¿Cuál es tu pregunta?"
                />
              </div>
            </div>

            {/* Fila 2: Tipo / Obligatoria (lado a lado) */}
            <div className="gs2-grid">
              <div className="gs2-form-row">
                <label>Tipo de respuesta</label>
                <div className="gs2-segmented">
                  {[
                    ["respuesta_corta", "Corta"],
                    ["opcion_multiple", "Múltiple"],
                    ["seleccion_unica", "Única"],
                    ["si_no", "Sí/No"],
                    ["escala_1_5", "Escala 1–5"],
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() =>
                        setNuevaPregunta({ ...nuevaPregunta, tipo_pregunta: val })
                      }
                      className={
                        "gs2-seg-item " +
                        (nuevaPregunta.tipo_pregunta === val ? "active" : "")
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="gs2-form-row">
                <label>Obligatoria</label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={nuevaPregunta.obligatoria}
                  onClick={() =>
                    setNuevaPregunta({
                      ...nuevaPregunta,
                      obligatoria: !nuevaPregunta.obligatoria,
                    })
                  }
                  className={"gs2-switch " + (nuevaPregunta.obligatoria ? "on" : "off")}
                >
                  <span className="knob" />
                </button>
              </div>
            </div>

            {/* Opciones (colapsable / solo si aplica) */}
            {requiereOpciones && (
              <div className="gs2-block">
                <details className="gs2-details" open>
                  <summary>Opciones</summary>

                  <div className="gs2-form-row">
                    <div className="gs2-inline">
                      <input
                        className="gs2-input flex-1"
                        placeholder="Escribe una opción…"
                        value={nuevaOpcion}
                        onChange={(e) => setNuevaOpcion(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && agregarOpcion()}
                      />
                      <button className="gs2-btn gs2-btn-ghost" onClick={agregarOpcion}>
                        Añadir
                      </button>
                    </div>
                  </div>

                  {!!opciones.length && (
                    <div className="gs2-chips">
                      {opciones.map((op, i) => (
                        <span className="gs2-chip" key={i}>
                          {op}
                          <button className="x" onClick={() => eliminarOpcionChip(i)}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="gs2-link"
                    onClick={() => setMostrarPegadoMasivo((v) => !v)}
                  >
                    {mostrarPegadoMasivo ? "Ocultar pegado masivo" : "Pegar varias opciones"}
                  </button>

                  {mostrarPegadoMasivo && (
                    <div className="gs2-form-row mt-6">
                      <textarea
                        rows={3}
                        className="gs2-input"
                        placeholder="Una por línea o separadas por coma / punto y coma"
                        value={bloqueOpciones}
                        onChange={(e) => setBloqueOpciones(e.target.value)}
                      />
                      <button className="gs2-btn gs2-btn-secondary mt-4" onClick={pegarEnBloque}>
                        Añadir opciones
                      </button>
                    </div>
                  )}

                  <p className="gs2-help">* Mínimo <b>2</b> opciones.</p>
                </details>
              </div>
            )}
          </div>

          <div className="gs2-pane-footer">
            <button
              className="gs2-btn gs2-btn-success w-100"
              onClick={crearPregunta}
              disabled={!puedeCrearPregunta}
            >
              Crear Pregunta
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
