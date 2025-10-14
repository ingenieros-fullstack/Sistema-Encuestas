import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../EditarFormulario.css";

export default function EditarFormulario() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    introduccion: "",
    texto_final: "",
    tipo: "Cuestionario",
    estatus: "abierto",
    fecha_inicio: "",
    fecha_fin: "",
    umbral_aprobacion: 70,
    tiempo_limite: 45,
    navegacion_preguntas: true,
    mostrar_respuestas: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const nombre = localStorage.getItem("nombre") || "Administrador";
  const rol = localStorage.getItem("rol") || "admin";

  const isCuestionario = useMemo(() => formulario.tipo === "Cuestionario", [formulario.tipo]);
  const isEncuesta = useMemo(() => formulario.tipo === "Encuesta", [formulario.tipo]);

  // ===== Helpers de redirección por auth =====
  const goLogin = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true, state: { nextPath: location.pathname } });
  }, [navigate, location.pathname]);

  // ===== GET /admin/formularios/:codigo =====
  const fetchFormulario = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      goLogin();
      return;
    }

    const ac = new AbortController();
    setLoading(true);
    setError("");

    (async () => {
      try {
        const res = await fetch(`${API_URL}/admin/formularios/${codigo}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal: ac.signal,
        });

        // Manejo de auth
        if (res.status === 401 || res.status === 403) {
          goLogin();
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.message || "Error al cargar el formulario");
          // regreso suave al listado
          setTimeout(() => navigate("/admin/formularios"), 1500);
          return;
        }

        const data = await res.json();
        const f = data.formulario || data;

        setFormulario({
          titulo: f.titulo || "",
          descripcion: f.descripcion || "",
          introduccion: f.introduccion || "",
          texto_final: f.texto_final || "",
          tipo: f.tipo || "Cuestionario",
          estatus: f.estatus || "abierto",
          fecha_inicio: f.fecha_inicio ? String(f.fecha_inicio).split("T")[0] : "",
          fecha_fin: f.fecha_fin ? String(f.fecha_fin).split("T")[0] : "",
          umbral_aprobacion: typeof f.umbral_aprobacion === "number" ? f.umbral_aprobacion : 70,
          tiempo_limite: typeof f.tiempo_limite === "number" ? f.tiempo_limite : 45,
          navegacion_preguntas: f.navegacion_preguntas ?? true,
          // 🔒 Si es Encuesta, siempre false
          mostrar_respuestas: f.tipo === "Encuesta" ? false : (f.mostrar_respuestas ?? true),
        });
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setError("Error de conexión al cargar el formulario");
          setTimeout(() => navigate("/admin/formularios"), 1500);
        }
      } finally {
        setLoading(false);
      }
    })();

    // cleanup
    return () => ac.abort();
  }, [API_URL, codigo, goLogin, navigate]);

  useEffect(() => {
    const cleanup = fetchFormulario();
    return cleanup;
  }, [fetchFormulario]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "mostrar_respuestas" && isEncuesta) return; // bloquea en Encuesta
    setFormulario((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // para sincronizar sliders con inputs numéricos
  const setField = useCallback(
    (name, value) => setFormulario((prev) => ({ ...prev, [name]: value })),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      goLogin();
      return;
    }

    try {
      // 🛡️ Payload seguro: en Encuesta, forzar mostrar_respuestas = false
      const payload =
        formulario.tipo === "Encuesta"
          ? { ...formulario, mostrar_respuestas: false }
          : formulario;

      const res = await fetch(`${API_URL}/admin/formularios/${codigo}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || "Error al actualizar el formulario");
        return;
      }

      navigate("/admin/formularios");
    } catch (err) {
      console.error(err);
      setError("Error de conexión al actualizar el formulario");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-body-tertiary">
        <Navbar rol={rol} nombre={nombre} />
        <main className="flex-grow-1 container-xxl py-4">
          <section className="section-card">
            <div className="d-flex align-items-center gap-3">
              <div className="spinner-border text-primary" role="status" />
              <div className="text-body-secondary">Cargando formulario…</div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-body-tertiary">
      <Navbar rol={rol} nombre={nombre} />

      {/* HERO */}
      <header className="page-hero container-xxl">
        <div className="page-hero__surface page-hero--accent">
          <div className="d-flex align-items-center gap-3">
            <span className="hero-icon bi bi-pencil-square"></span>
            <div>
              <h1 className="h3 mb-1">Editar Formulario</h1>
              <p className="mb-0 text-body-secondary">Código: {codigo}</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/admin/formularios")}
            >
              <i className="bi bi-arrow-left me-2"></i> Volver
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow-1 container-xxl py-4">
        {error && (
          <section className="section-card mb-3">
            <div className="alert alert-danger mb-0">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          </section>
        )}

        <form onSubmit={handleSubmit}>
          <div className="settings-grid">
            {/* Columna principal */}
            <div className="setting-card">
              <div className="setting-card__title">
                <i className="bi bi-info-circle"></i> Información
              </div>

              <div className="nf-grid nf-grid-2">
                <div className="col-12">
                  <label className="form-label">
                    Título del Formulario <span className="text-danger">*</span>
                  </label>
                  <div className="input-icon">
                    <i className="bi bi-type"></i>
                    <input
                      type="text"
                      name="titulo"
                      className="form-control"
                      value={formulario.titulo}
                      onChange={handleChange}
                      placeholder="Ingresa el título del formulario"
                      required
                    />
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">Descripción</label>
                  <textarea
                    name="descripcion"
                    rows={3}
                    className="form-control"
                    value={formulario.descripcion}
                    onChange={handleChange}
                    placeholder="Describe el propósito del formulario"
                  />
                </div>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-card__title">
                <i className="bi bi-chat-left-text"></i> Mensajes
              </div>

              <div className="nf-grid nf-grid-2">
                <div className="form-floating">
                  <textarea
                    id="intro"
                    className="form-control"
                    name="introduccion"
                    value={formulario.introduccion}
                    onChange={handleChange}
                    placeholder="Introducción"
                    style={{ minHeight: 120 }}
                  />
                  <label htmlFor="intro">Introducción</label>
                </div>

                <div className="form-floating">
                  <textarea
                    id="final"
                    className="form-control"
                    name="texto_final"
                    value={formulario.texto_final}
                    onChange={handleChange}
                    placeholder="Texto final"
                    style={{ minHeight: 120 }}
                  />
                  <label htmlFor="final">Texto Final</label>
                </div>
              </div>
            </div>

            {/* Columna lateral */}
            <div className="setting-card">
              <div className="setting-card__title">
                <i className="bi bi-sliders2"></i> Propiedades
              </div>

              {/* ⬇️ Izquierda (Tipo/Estado) | Derecha (Fechas) */}
              <div className="nf-grid nf-grid-2">
                {/* Izquierda: Tipo + Estado */}
                <div>
                  {/* Tipo */}
                  <div className="mb-3">
                    <label className="form-label d-block">
                      <i className="bi bi-ui-radios-grid me-1"></i> Tipo{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <div className="segmented">
                      <input
                        id="tipo-enc"
                        type="radio"
                        name="tipo"
                        className="segmented-input"
                        checked={formulario.tipo === "Encuesta"}
                        onChange={() =>
                          setFormulario((prev) => ({
                            ...prev,
                            tipo: "Encuesta",
                            mostrar_respuestas: false, // 🔒 al cambiar a Encuesta
                          }))
                        }
                      />
                      <label className="segmented-item" htmlFor="tipo-enc">
                        <i className="bi bi-ui-radios-grid"></i> Encuesta
                      </label>

                      <input
                        id="tipo-cue"
                        type="radio"
                        name="tipo"
                        className="segmented-input"
                        checked={formulario.tipo === "Cuestionario"}
                        onChange={() =>
                          setFormulario((prev) => ({
                            ...prev,
                            tipo: "Cuestionario",
                            // no tocamos mostrar_respuestas: el usuario decide
                          }))
                        }
                      />
                      <label className="segmented-item" htmlFor="tipo-cue">
                        <i className="bi bi-journal-check"></i> Cuestionario
                      </label>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="mb-3">
                    <label className="form-label d-block">
                      <i className="bi bi-unlock me-1"></i> Estado{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <div className="segmented">
                      <input
                        id="est-abierto"
                        type="radio"
                        name="estatus"
                        className="segmented-input"
                        checked={formulario.estatus === "abierto"}
                        onChange={() => setField("estatus", "abierto")}
                      />
                      <label className="segmented-item" htmlFor="est-abierto">
                        <i className="bi bi-unlock"></i> Abierto
                      </label>

                      <input
                        id="est-cerrado"
                        type="radio"
                        name="estatus"
                        className="segmented-input"
                        checked={formulario.estatus === "cerrado"}
                        onChange={() => setField("estatus", "cerrado")}
                      />
                      <label className="segmented-item" htmlFor="est-cerrado">
                        <i className="bi bi-lock"></i> Cerrado
                      </label>
                    </div>
                  </div>
                </div>

                {/* Derecha: Fechas */}
                <div>
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="bi bi-calendar-event me-1"></i> Fecha de Inicio
                    </label>
                    <div className="input-icon">
                      <i className="bi bi-calendar3"></i>
                      <input
                        type="date"
                        name="fecha_inicio"
                        className="form-control"
                        value={formulario.fecha_inicio}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">
                      <i className="bi bi-calendar-check me-1"></i> Fecha de Fin
                    </label>
                    <div className="input-icon">
                      <i className="bi bi-calendar3-event"></i>
                      <input
                        type="date"
                        name="fecha_fin"
                        className="form-control"
                        value={formulario.fecha_fin}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* ⬆️ Fin */}
            </div>

            {/* Parámetros */}
            <div className="setting-card">
              <div className="setting-card__title">
                <i className="bi bi-speedometer2"></i> Parámetros
              </div>

              <div className="param-grid">
                {/* Tiempo límite */}
                <div>
                  <div className="form-label fw-semibold">Tiempo Límite (minutos)</div>
                  <div className="param-card">
                    <input
                      type="range"
                      min="0"
                      max="180"
                      step="5"
                      value={Number(formulario.tiempo_limite || 0)}
                      onChange={(e) => setField("tiempo_limite", Number(e.target.value))}
                      className="form-range"
                      aria-label="Tiempo límite (min)"
                    />
                    <div className="input-group input-unit" style={{ minWidth: 120 }}>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        step="1"
                        name="tiempo_limite"
                        value={formulario.tiempo_limite}
                        onChange={(e) => setField("tiempo_limite", Number(e.target.value))}
                        className="form-control text-end"
                        placeholder="0"
                      />
                      <span className="input-group-text">min</span>
                    </div>
                  </div>
                  <div className="form-text">Usa 0 si no deseas límite de tiempo.</div>
                </div>

                {/* Umbral solo para Cuestionario */}
                {isCuestionario && (
                  <div>
                    <div className="form-label fw-semibold">Umbral de Aprobación</div>
                    <div className="param-card">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={Number(formulario.umbral_aprobacion || 0)}
                        onChange={(e) => setField("umbral_aprobacion", Number(e.target.value))}
                        className="form-range"
                        aria-label="Umbral de aprobación (%)"
                      />
                      <div className="input-group input-unit" style={{ minWidth: 120 }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          name="umbral_aprobacion"
                          value={formulario.umbral_aprobacion}
                          onChange={(e) => setField("umbral_aprobacion", Number(e.target.value))}
                          className="form-control text-end"
                          placeholder="70"
                        />
                        <span className="input-group-text">%</span>
                      </div>
                    </div>
                    <div className="form-text">Se usa en reportes y reglas de aprobación.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Preferencias */}
            <div className="setting-card">
              <div className="setting-card__title">
                <i className="bi bi-gear"></i> Preferencias
              </div>

              <ul className="option-list">
                <li className="option-row">
                  <div className="option-icon">
                    <i className="bi bi-arrow-left-right"></i>
                  </div>
                  <div className="option-body">
                    <div className="option-title">Permitir navegación entre preguntas</div>
                    <div className="option-desc">El participante puede revisar y editar respuestas.</div>
                  </div>
                  <div className="option-action">
                    <div className="form-check form-switch m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="navPreguntas"
                        name="navegacion_preguntas"
                        checked={!!formulario.navegacion_preguntas}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </li>

                <li className="option-row">
                  <div className="option-icon">
                    <i className="bi bi-eye"></i>
                  </div>
                  <div className="option-body">
                    <div className="option-title">Mostrar respuestas al finalizar</div>
                    <div className="option-desc">
                      Muestra un resumen al completar el formulario.
                      {!isCuestionario && (
                        <span className="text-muted d-block mt-1">
                          (No disponible para formularios de tipo Encuesta)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="option-action">
                    <div className="form-check form-switch m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="mostrarResp"
                        name="mostrar_respuestas"
                        checked={isCuestionario ? !!formulario.mostrar_respuestas : false}
                        onChange={handleChange}
                        disabled={!isCuestionario}
                      />
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Barra de acciones */}
          <div className="actionbar actionbar--gradient d-flex justify-content-between align-items-center mt-3">
            <div className="text-body-secondary d-flex align-items-center gap-2">
              <i className="bi bi-shield-check"></i>
              Revisa los cambios antes de guardar.
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-ghost-secondary"
                onClick={() => navigate("/admin/formularios")}
                disabled={saving}
              >
                <i className="bi bi-x-lg me-2"></i> Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-2"></i> Actualizar Formulario
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
