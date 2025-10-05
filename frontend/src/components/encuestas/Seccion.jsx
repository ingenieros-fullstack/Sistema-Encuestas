import { useMemo } from "react";
import Pregunta from "./Pregunta";

export default function Seccion({
  seccion,
  index = 0,
  totalSecciones = 1,
  modo = "preview",
  onFinalizar,
  // estado controlado
  respuestas = {},
  onRespuesta,
}) {
  // --- visibilidad condicional por pregunta ---
  // soporta:
  //  - depende_de: id_pregunta padre
  //  - valor_esperado | condicion_valor: valor esperado en el padre
  //  - operador: "equals" (default) | "includes"
  const cumpleCondicion = (p) => {
    if (!p?.depende_de) return true;
    const vPadre = respuestas[p.depende_de];
    const esperado = p.valor_esperado ?? p.condicion_valor;
    const operador = (p.operador || "equals").toLowerCase();

    if (operador === "includes") {
      return Array.isArray(vPadre) && vPadre.includes(esperado);
    }
    return vPadre === esperado; // equals
  };

  const preguntasVisibles = useMemo(() => {
    const lista = seccion?.Preguntas || [];
    return lista.filter(cumpleCondicion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seccion, respuestas]); // re-evaluar cuando cambien respuestas

  const totalVisibles = preguntasVisibles.length;

  return (
    <div className="card section-card border-0 shadow-sm mb-4">
      <div className="card-body p-md-4">
        {/* Encabezado sección */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h6 mb-0 d-flex align-items-center gap-2">
            <span className="section-pill">{index + 1}</span>
            <span className="text-truncate">
              {seccion?.nombre_seccion || `Sección ${index + 1}`}
            </span>
            <span className="text-muted">/ {totalSecciones}</span>
          </h2>
          <span className="section-badge">{totalVisibles} preguntas</span>
        </div>

        {/* Preguntas visibles */}
        {preguntasVisibles.map((p, i) => (
          <Pregunta
            key={p.id_pregunta ?? `${index}-${i}`}
            pregunta={p}
            index={i + 1}
            modo={modo}
            respuestas={respuestas}
            onRespuesta={onRespuesta}
          />
        ))}

        {totalVisibles === 0 && (
          <div className="alert alert-warning mb-0">
            Esta sección no tiene preguntas visibles.
          </div>
        )}

        {onFinalizar && (
          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-gradient" onClick={onFinalizar}>
              Finalizar sección
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
