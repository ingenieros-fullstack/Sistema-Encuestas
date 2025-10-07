export default function PasoInformacion({
  rol,
  navigate,
  formData,
  handleInputChange,
  generalErrors,
  isGeneralValid,
  goNext,
}) {
  return (
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
              className={`form-control form-control-lg ${
                generalErrors.titulo ? "is-invalid" : ""
              }`}
              placeholder="Ej: Encuesta de Satisfacción"
              required
            />
            {generalErrors.titulo && (
              <div className="invalid-feedback">{generalErrors.titulo}</div>
            )}
          </div>
        </div>

        {/* Tipo */}
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
              onChange={() =>
                handleInputChange({
                  target: { name: "tipo", value: "Encuesta" },
                })
              }
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
              onChange={() =>
                handleInputChange({
                  target: { name: "tipo", value: "Cuestionario" },
                })
              }
            />
            <label htmlFor="tipoCuestionario" className="segmented-item">
              <i className="bi bi-journal-check me-1"></i> Cuestionario
            </label>
          </div>
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
              className="form-control"
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
              className={`form-control ${
                generalErrors.fecha ? "is-invalid" : ""
              }`}
            />
            {generalErrors.fecha && (
              <div className="invalid-feedback d-block">
                {generalErrors.fecha}
              </div>
            )}
          </div>
        </div>
      </div>

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
            >
              Siguiente <i className="bi bi-arrow-right-short"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
