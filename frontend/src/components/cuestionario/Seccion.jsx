// src/components/Seccion.jsx (cuestionario)

import Pregunta from "./Pregunta";

/* Helpers de normalización */
const getQuestions = (sec) => {
  if (!sec) return [];
  return (
    sec.Preguntas ||   // plural (habitual)
    sec.Pregunta  ||   // singular (algunas respuestas de la API)
    sec.preguntas ||   // por si viene en minúscula
    []
  );
};

export default function Seccion({
  seccion,
  modo = "resolver",          // "resolver" | "preview"
  respuestas = {},            // estado controlado desde el padre
  onResponder,                // (id_pregunta, valor) => void
  onFinalizar,                // opcional
}) {
  const preguntas = getQuestions(seccion);

  return (
    <div className="mb-3">
      {/* Render de preguntas */}
      {preguntas.length > 0 ? (
        preguntas.map((pregunta, i) => (
          <Pregunta
            key={pregunta.id_pregunta ?? pregunta.id ?? i}
            pregunta={pregunta}
            idx={i}
            modo={modo}
            respuestas={respuestas}
            onResponder={onResponder}
          />
        ))
      ) : (
        <div className="alert alert-secondary mb-0">
          No hay preguntas en esta sección.
        </div>
      )}

      {/* Botón finalizar opcional */}
      {onFinalizar && (
        <div className="text-end mt-3">
          <button
            onClick={onFinalizar}
            className="btn btn-primary"
          >
            Finalizar
          </button>
        </div>
      )}
    </div>
  );
}
