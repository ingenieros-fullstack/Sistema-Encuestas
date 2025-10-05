export default function Pregunta({
  pregunta,
  index = 1,
  modo = "preview",
  respuestas = {},
  onRespuesta,
}) {
  const disabled = modo === "preview";
  const opciones = pregunta?.Opciones || [];
  const id = pregunta?.id_pregunta;

  const tipo = (pregunta?.tipo_pregunta || "").toLowerCase();

  const getOpValue = (op) =>
    op?.valor ?? op?.value ?? op?.id_opcion ?? op?.texto_opcion ?? op?.texto ?? op;

  const getOpLabel = (op) =>
    op?.texto_opcion ?? op?.texto ?? String(getOpValue(op));

  const valor = respuestas[id];

  const setValor = (v) => {
    if (disabled) return;
    if (!id) return;
    onRespuesta && onRespuesta(id, v);
  };

  const toggleMultiple = (opValue) => {
    if (disabled) return;
    const prev = Array.isArray(valor) ? valor : [];
    if (prev.includes(opValue)) {
      setValor(prev.filter((x) => x !== opValue));
    } else {
      setValor([...prev, opValue]);
    }
  };

  return (
    <div className="card pregunta-card border-0 shadow-sm mb-3">
      <div className="card-body pb-3">
        {/* Encabezado (sin badge de tipo) */}
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="section-pill">{index}</span>
          <strong className="flex-grow-1">{pregunta?.enunciado}</strong>
        </div>

        {/* Contenido según tipo */}

        {/* Respuesta corta */}
        {tipo === "respuesta_corta" && (
          <input
            type="text"
            className="form-control bg-body-secondary"
            placeholder="Tu respuesta..."
            disabled={disabled}
            value={valor ?? ""}
            onChange={(e) => setValor(e.target.value)}
          />
        )}

        {/* Sí / No */}
        {tipo === "si_no" && (
          <div className="d-flex gap-3 mt-1">
            {[
              { v: "si", label: "Sí" },
              { v: "no", label: "No" },
            ].map(({ v, label }) => (
              <div className="form-check" key={v}>
                <input
                  className="form-check-input"
                  type="radio"
                  name={`p-${id}`}
                  id={`p-${id}-${v}`}
                  disabled={disabled}
                  checked={valor === v}
                  onChange={() => setValor(v)}
                />
                <label className="form-check-label" htmlFor={`p-${id}-${v}`}>
                  {label}
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Escala 1–5 (responsive con .scale-grid) */}
        {tipo === "escala_1_5" && (
          <div className="scale-grid mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <div className="form-check" key={n}>
                <input
                  className="form-check-input"
                  type="radio"
                  name={`p-${id}`}
                  id={`p-${id}-n${n}`}
                  disabled={disabled}
                  checked={Number(valor) === n}
                  onChange={() => setValor(n)}
                />
                <label className="form-check-label" htmlFor={`p-${id}-n${n}`}>
                  {n}
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Selección única */}
        {tipo === "seleccion_unica" && opciones.length > 0 && (
          <div className="d-flex flex-column gap-2 mt-1">
            {opciones.map((op, i) => {
              const opValue = getOpValue(op);
              const opLabel = getOpLabel(op);
              const htmlId = `p-${id}-r-${i}`;
              return (
                <div className="form-check" key={htmlId}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`p-${id}`}
                    id={htmlId}
                    disabled={disabled}
                    checked={valor === opValue}
                    onChange={() => setValor(opValue)}
                  />
                  <label className="form-check-label" htmlFor={htmlId}>
                    {opLabel}
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {/* Opción múltiple */}
        {tipo === "opcion_multiple" && opciones.length > 0 && (
          <div className="d-flex flex-column gap-2 mt-1">
            {opciones.map((op, i) => {
              const opValue = getOpValue(op);
              const opLabel = getOpLabel(op);
              const htmlId = `p-${id}-c-${i}`;
              const checked = Array.isArray(valor) && valor.includes(opValue);
              return (
                <div className="form-check" key={htmlId}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={htmlId}
                    disabled={disabled}
                    checked={!!checked}
                    onChange={() => toggleMultiple(opValue)}
                  />
                  <label className="form-check-label" htmlFor={htmlId}>
                    {opLabel}
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {/* Condicional: si define opciones, la tratamos como radio */}
        {tipo === "condicional" && opciones.length > 0 && (
          <div className="d-flex flex-column gap-2 mt-1">
            {opciones.map((op, i) => {
              const opValue = getOpValue(op);
              const opLabel = getOpLabel(op);
              const htmlId = `p-${id}-cond-${i}`;
              return (
                <div className="form-check" key={htmlId}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`p-${id}`}
                    id={htmlId}
                    disabled={disabled}
                    checked={valor === opValue}
                    onChange={() => setValor(opValue)}
                  />
                  <label className="form-check-label" htmlFor={htmlId}>
                    {opLabel}
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {/* Pie (solo en preview) */}
        {disabled && (
          <div className="small text-muted mt-2">Vista previa (bloqueado)</div>
        )}
      </div>
    </div>
  );
}
