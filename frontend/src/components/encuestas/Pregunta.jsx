export default function Pregunta({ pregunta, modo = "preview", onRespuesta }) {
  const handleChange = (valor) => {
    if (onRespuesta && modo !== "preview") {
      onRespuesta(pregunta.id_pregunta, valor);
    }
  };

  const opciones = pregunta.Opciones || [];

  return (
    <div className="mb-4 text-left">
      <p className="font-medium mb-2">{pregunta.enunciado}</p>

      {/* Bloqueado en preview */}
      {pregunta.tipo_pregunta === "respuesta_corta" && (
        <input
          type="text"
          className="border p-2 w-full bg-gray-100 text-gray-500"
          disabled={modo === "preview"}
          onChange={(e) => handleChange(e.target.value)}
        />
      )}

      {pregunta.tipo_pregunta === "si_no" && (
        <select
          className="border p-2 w-full bg-gray-100 text-gray-500"
          disabled={modo === "preview"}
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value="">Seleccione...</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
      )}

      {pregunta.tipo_pregunta === "escala_1_5" && (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="flex items-center gap-1">
              <input
                type="radio"
                name={`preg-${pregunta.id_pregunta}`}
                value={n}
                disabled={modo === "preview"}
                onChange={(e) => handleChange(e.target.value)}
              />
              {n}
            </label>
          ))}
        </div>
      )}

      {pregunta.tipo_pregunta === "seleccion_unica" && opciones.length > 0 && (
        <div className="flex flex-col gap-1">
          {opciones.map((op, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name={`preg-${pregunta.id_pregunta}`}
                value={op.valor ?? op.texto ?? op}
                disabled={modo === "preview"}
                onChange={(e) => handleChange(e.target.value)}
              />
              <span>{op.texto ?? op}</span>
            </label>
          ))}
        </div>
      )}

      {pregunta.tipo_pregunta === "opcion_multiple" && opciones.length > 0 && (
        <div className="flex flex-col gap-1">
          {opciones.map((op, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={op.valor ?? op.texto ?? op}
                disabled={modo === "preview"}
                onChange={(e) => handleChange(e.target.value)}
              />
              <span>{op.texto ?? op}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
