export default function PreviewAside({ preview }) {
  return (
    <aside className="col-12 col-lg-4">
      <div className="sticky-aside">
        {/* Tarjeta de vista previa */}
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

        {/* Tarjeta de tips */}
        <div className="tips-card">
          <i className="bi bi-stars"></i>
          <div>
            <strong>Tip:</strong> usa descripciones claras y un rango de fechas realista para mejores tasas de respuesta.
          </div>
        </div>
      </div>
    </aside>
  );
}
