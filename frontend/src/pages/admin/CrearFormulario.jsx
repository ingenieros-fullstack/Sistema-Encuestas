import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import EncuestaConfig from "../../components/forms/EncuestaConfig";
import CuestionarioConfig from "../../components/forms/CuestionarioConfig";
import "../../NuevoFormulario.css";

export default function CrearFormulario() {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "Encuesta",
    fecha_inicio: "",
    fecha_fin: "",
    introduccion: "",
    texto_final: "",
    umbral_aprobacion: "70",
    tiempo_limite: "0",
    navegacion_preguntas: false,
    mostrar_respuestas: false,
  });

  const [step, setStep] = useState(1); // 1: Información, 2: Configuración
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [generalErrors, setGeneralErrors] = useState({});
  const rol = localStorage.getItem("rol") || "admin";
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const next = { ...formData, [name]: type === "checkbox" ? checked : value };
    setFormData(next);
    if (step === 1) setGeneralErrors(validateGeneral(next));
  };

  // Validaciones del paso 1
  const validateGeneral = (data) => {
    const errs = {};
    if (!data.titulo?.trim()) errs.titulo = "El título es obligatorio.";
    if (data.fecha_inicio && data.fecha_fin && data.fecha_fin < data.fecha_inicio) {
      errs.fecha = "La fecha de fin no puede ser anterior al inicio.";
    }
    return errs;
  };

  const isGeneralValid = useMemo(
    () => Object.keys(validateGeneral(formData)).length === 0,
    [formData]
  );

  const goNext = () => {
    const errs = validateGeneral(formData);
    setGeneralErrors(errs);
    if (Object.keys(errs).length === 0) setStep(2);
  };

  const goBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 2) return;
    setLoading(true);
    setMensaje("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/admin/formularios", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje("Formulario creado exitosamente");
        setTimeout(() => navigate("/admin/formularios"), 1200);
      } else {
        setMensaje(data.message || "Error al crear formulario");
      }
    } catch {
      setMensaje("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Vista previa lateral
  const preview = useMemo(() => {
    const rango =
      formData.fecha_inicio && formData.fecha_fin
        ? `${formData.fecha_inicio} → ${formData.fecha_fin}`
        : "Sin rango definido";
    return {
      titulo: formData.titulo || "Nuevo formulario",
      tipo: formData.tipo,
      descripcion: formData.descripcion || "Agrega una descripción breve…",
      rango,
    };
  }, [formData]);

  return (
    <div className="min-vh-100 d-flex flex-column bg-body-tertiary">
      <Navbar rol="admin" nombre={localStorage.getItem("nombre") || "Admin"} />

      {/* HERO / STEPPER */}
      <header className="page-hero container-xxl">
        <div className="page-hero__surface page-hero--accent">
          <div className="d-flex align-items-center gap-3">
            <span className="hero-icon bi bi-clipboard2-check"></span>
            <div>
              <h1 className="h3 mb-1">Crear Nuevo Formulario</h1>
              <p className="mb-0 text-body-secondary">
                Diseña encuestas y cuestionarios con controles claros y una vista previa.
              </p>
            </div>
          </div>

          <div className="chips">
            <button
              type="button"
              className={`chip ${step === 1 ? "active" : ""}`}
              onClick={() => setStep(1)}
              aria-current={step === 1}
            >
              <i className="bi bi-info-circle"></i> Información
            </button>

            <button
              type="button"
              className={`chip ${step === 2 ? "active" : ""} ${!isGeneralValid ? "disabled" : ""}`}
              onClick={() => isGeneralValid && setStep(2)}
              aria-disabled={!isGeneralValid}
              title={!isGeneralValid ? "Completa la Información General para continuar" : "Ir a Configuración"}
            >
              <i className="bi bi-sliders"></i> Configuración
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow-1 container-xxl py-4">
        <form onSubmit={handleSubmit} className="row g-4">
          {/* Columna principal */}
          <div className="col-12 col-lg-8">
            {/* PASO 1: INFORMACIÓN */}
            {step === 1 && (
              <section className="section-card section--info">
                <div className="section-card__header">
                  <i className="bi bi-info-circle"></i>
                  <h2 className="h5 mb-0">Información General</h2>
                </div>

                <div className="nf-grid nf-grid-2">
                  {/* Título */}
                  <div>
                    <label className="form-label">
                      Título del Formulario <span className="text-danger">*</span>
                    </label>
                    <div className="input-icon">
                      <i className="bi bi-type"></i>
                      <input
                        type="text"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        className={`form-control form-control-lg ${generalErrors.titulo ? "is-invalid" : ""}`}
                        placeholder="Ej: Encuesta de Satisfacción"
                        required
                      />
                      {generalErrors.titulo && <div className="invalid-feedback">{generalErrors.titulo}</div>}
                    </div>
                    <div className="form-text">Usa un nombre claro y breve (máx. 80 caracteres).</div>
                  </div>

                  {/* Tipo (segmented) */}
                  <div>
                    <label className="form-label">
                      Tipo de Formulario <span className="text-danger">*</span>
                    </label>
                    <div className="segmented">
                      <input
                        type="radio"
                        id="tipoEncuesta"
                        name="tipoSegmented"
                        className="segmented-input"
                        checked={formData.tipo === "Encuesta"}
                        onChange={() => setFormData((p) => ({ ...p, tipo: "Encuesta" }))}
                      />
                      <label htmlFor="tipoEncuesta" className="segmented-item">
                        <i className="bi bi-ui-radios-grid me-1"></i> Encuesta
                      </label>

                      <input
                        type="radio"
                        id="tipoCuestionario"
                        name="tipoSegmented"
                        className="segmented-input"
                        checked={formData.tipo === "Cuestionario"}
                        onChange={() => setFormData((p) => ({ ...p, tipo: "Cuestionario" }))}
                      />
                      <label htmlFor="tipoCuestionario" className="segmented-item">
                        <i className="bi bi-journal-check me-1"></i> Cuestionario
                      </label>
                    </div>
                    <div className="form-text">Puedes cambiarlo en cualquier momento antes de guardar.</div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="mt-3">
                  <label className="form-label">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows="3"
                    className="form-control"
                    placeholder="Breve descripción del propósito del formulario"
                  ></textarea>
                </div>

                {/* Fechas */}
                <div className="nf-grid nf-grid-2 mt-3">
                  <div>
                    <label className="form-label">Fecha de Inicio</label>
                    <div className="input-icon">
                      <i className="bi bi-calendar-event"></i>
                      <input
                        type="date"
                        name="fecha_inicio"
                        value={formData.fecha_inicio}
                        onChange={handleInputChange}
                        className={`form-control ${generalErrors.fecha ? "is-invalid" : ""}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Fecha de Fin</label>
                    <div className="input-icon">
                      <i className="bi bi-calendar-check"></i>
                      <input
                        type="date"
                        name="fecha_fin"
                        value={formData.fecha_fin}
                        onChange={handleInputChange}
                        className={`form-control ${generalErrors.fecha ? "is-invalid" : ""}`}
                      />
                      {generalErrors.fecha && <div className="invalid-feedback d-block">{generalErrors.fecha}</div>}
                    </div>
                  </div>
                </div>

                {/* Actionbar paso 1 */}
                <div className="actionbar">
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="d-none d-sm-flex align-items-center gap-2 text-body-secondary">
                      <i className="bi bi-info-square"></i>
                      <small>Completa los campos obligatorios para continuar.</small>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost-secondary"
                        onClick={() => navigate(`/${rol}/dashboard`)}
                      >
                        <i className="bi bi-x-circle"></i> Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary px-4"
                        onClick={goNext}
                        disabled={!isGeneralValid}
                        title={!isGeneralValid ? "Faltan campos por completar" : "Ir a Configuración"}
                      >
                        Siguiente <i className="bi bi-arrow-right-short"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* PASO 2: CONFIGURACIÓN */}
            {step === 2 && (
              <section className="section-card section--accent">
                <div className="section-card__header">
                  <i className="bi bi-sliders"></i>
                  <h2 className="h5 mb-0">Configuración de {formData.tipo}</h2>
                </div>

                {formData.tipo === "Encuesta" ? (
                  <EncuestaConfig formData={formData} handleInputChange={handleInputChange} />
                ) : (
                  <CuestionarioConfig formData={formData} handleInputChange={handleInputChange} />
                )}

                {/* Actionbar paso 2 */}
                <div className="actionbar actionbar--gradient">
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="d-none d-sm-flex align-items-center gap-2 text-body-secondary">
                      <i className="bi bi-shield-check"></i>
                      <small>Revisa los parámetros y guarda cuando estés listo.</small>
                    </div>
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-ghost-secondary" onClick={goBack}>
                        <i className="bi bi-arrow-left-short"></i> Atrás
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost-secondary"
                        onClick={() => navigate(`/${rol}/dashboard`)}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creando…
                          </>
                        ) : (
                          <>
                            <i className="bi bi-save2 me-2"></i>
                            Crear Formulario
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {mensaje && (
                    <div
                      className={`alert mt-3 mb-0 ${
                        mensaje.includes("exitosamente") ? "alert-success" : "alert-danger"
                      }`}
                    >
                      {mensaje}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="col-12 col-lg-4">
            <div className="sticky-aside">
              <div className="preview-card preview--glass">
                <div className="preview-card__header">
                  <span className="badge rounded-pill text-bg-primary">
                    <i className="bi bi-lightning-charge"></i> Vista previa
                  </span>
                </div>
                <h3 className="h5 mb-1">{preview.titulo}</h3>
                <div className="mb-2">
                  <span className="badge bg-secondary-subtle text-secondary-emphasis me-1">
                    <i className="bi bi-ui-radios-grid me-1"></i>
                    {preview.tipo}
                  </span>
                </div>
                <p className="text-body-secondary mb-3">{preview.descripcion}</p>
                <div className="d-flex align-items-center gap-2 small text-body-secondary mb-3">
                  <i className="bi bi-calendar-range"></i>
                  {preview.rango}
                </div>
                <ul className="list-unstyled small mb-0">
                  <li className="d-flex align-items-center gap-2">
                    <i className="bi bi-check2-circle text-success"></i>
                    Campos necesarios: Título y Tipo
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <i className="bi bi-shield-lock text-primary"></i>
                    Respaldo con token (Bearer)
                  </li>
                </ul>
              </div>

              <div className="tips-card">
                <i className="bi bi-stars"></i>
                <div>
                  <strong>Tip:</strong> usa descripciones claras y un rango de fechas realista para mejores tasas de
                  respuesta.
                </div>
              </div>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}
