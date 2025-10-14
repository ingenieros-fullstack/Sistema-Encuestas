export default function Pregunta({ pregunta, modo, respuesta, onResponder }) {
  const opciones =
    pregunta.tipo_pregunta === "opcion_multiple" ||
    pregunta.tipo_pregunta === "seleccion_unica"
      ? (pregunta.respuesta_correcta || "").split(";").map((o) => o.trim())
      : [];

  const handleChange = (valor) => {
    if (onResponder) {
      onResponder(pregunta.id_pregunta, valor);
    }
  };

  return (
    <div className="mb-4">
      <label className="block font-medium text-gray-800 mb-2">
        {pregunta.numero_pregunta}. {pregunta.enunciado}
        {pregunta.obligatoria ? <span className="text-red-500"> *</span> : ""}
        {modo === "resolver" && (
          <span className="ml-2 text-sm text-gray-500">
            (Puntaje máx: {pregunta.puntaje || 10})
          </span>
        )}
      </label>

      {/* Preview: solo mostrar texto */}
      {modo === "preview" && (
        <p className="text-gray-600 italic">[Vista previa de la pregunta]</p>
      )}

      {/* Resolver: mostrar input segun tipo */}
      {modo === "resolver" && (
        <>
          {pregunta.tipo_pregunta === "respuesta_corta" && (
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={respuesta || ""}
              onChange={(e) => handleChange(e.target.value)}
            />
          )}

          {pregunta.tipo_pregunta === "si_no" && (
            <div className="flex gap-4">
              {["Sí", "No"].map((op) => (
                <label key={op} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`preg-${pregunta.id_pregunta}`}
                    value={op}
                    checked={respuesta === op}
                    onChange={() => handleChange(op)}
                  />
                  {op}
                </label>
              ))}
            </div>
          )}

          {pregunta.tipo_pregunta === "seleccion_unica" && (
            <div className="flex flex-col gap-2">
              {opciones.map((op, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`preg-${pregunta.id_pregunta}`}
                    value={op}
                    checked={respuesta === op}
                    onChange={() => handleChange(op)}
                  />
                  {op}
                </label>
              ))}
            </div>
          )}

          {pregunta.tipo_pregunta === "opcion_multiple" && (
            <div className="flex flex-col gap-2">
              {opciones.map((op, idx) => {
                const seleccionadas = respuesta ? respuesta.split(";") : [];
                return (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={op}
                      checked={seleccionadas.includes(op)}
                      onChange={(e) => {
                        let nuevas = [...seleccionadas];
                        if (e.target.checked) {
                          nuevas.push(op);
                        } else {
                          nuevas = nuevas.filter((v) => v !== op);
                        }
                        handleChange(nuevas.join(";"));
                      }}
                    />
                    {op}
                  </label>
                );
              })}
            </div>
          )}

          {pregunta.tipo_pregunta === "escala_1_5" && (
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`preg-${pregunta.id_pregunta}`}
                    value={num}
                    checked={respuesta === String(num)}
                    onChange={() => handleChange(String(num))}
                  />
                  {num}
                </label>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
