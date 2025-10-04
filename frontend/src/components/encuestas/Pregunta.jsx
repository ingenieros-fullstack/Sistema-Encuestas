export default function Pregunta({ pregunta, index = 1, modo = "preview" }) {
  const disabled = modo === "preview";

  const mapTipo = (t) => {
    switch (t) {
      case "respuesta_corta": return "Respuesta Corta";
      case "si_no": return "Sí / No";
      case "escala_1_5": return "Escala 1–5";
      case "seleccion_unica": return "Selección Única";
      case "opcion_multiple": return "Opción Múltiple";
      case "condicional": return "Condicional";
      default: return t || "—";
    }
  };

  const opciones = pregunta.Opciones || [];

  return (
    <div className="card pregunta-card border-0 shadow-sm mb-3">
      <div className="card-body pb-3">
        {/* ENCABEZADO */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="section-pill">{index}</span>
            <strong>{pregunta.enunciado}</strong>
          </div>
          <span className="badge text-bg-light fw-semibold text-dark">
            {mapTipo(pregunta.tipo_pregunta)}
          </span>
        </div>

        {/* CONTENIDO SEGÚN TIPO */}
        {pregunta.tipo_pregunta === "respuesta_corta" && (
          <input
            type="text"
            className="form-control bg-body-secondary"
            placeholder="Tu respuesta..."
            disabled={disabled}
          />
        )}

        {pregunta.tipo_pregunta === "si_no" && (
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" disabled>
              Sí
            </button>
            <button className="btn btn-outline-secondary btn-sm" disabled>
              No
            </button>
          </div>
        )}

        {pregunta.tipo_pregunta === "escala_1_5" && (
          <div className="d-flex gap-3 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="d-flex align-items-center gap-1">
                <input type="radio" disabled name={`p-${pregunta.id_pregunta}`} /> {n}
              </label>
            ))}
          </div>
        )}

        {pregunta.tipo_pregunta === "seleccion_unica" && opciones.length > 0 && (
          <div className="d-flex flex-column gap-1 mt-1">
            {opciones.map((op, i) => (
              <label key={i} className="d-flex align-items-center gap-2">
                <input type="radio" disabled name={`p-${pregunta.id_pregunta}`} />
                <span>{op.texto ?? op}</span>
              </label>
            ))}
          </div>
        )}

        {pregunta.tipo_pregunta === "opcion_multiple" && opciones.length > 0 && (
          <div className="d-flex flex-column gap-1 mt-1">
            {opciones.map((op, i) => (
              <label key={i} className="d-flex align-items-center gap-2">
                <input type="checkbox" disabled />
                <span>{op.texto ?? op}</span>
              </label>
            ))}
          </div>
        )}

        {/* PIE DE PREGUNTA */}
        {disabled && (
          <div className="small text-muted mt-2">Vista previa (bloqueado)</div>
        )}
      </div>
    </div>
  );
}
