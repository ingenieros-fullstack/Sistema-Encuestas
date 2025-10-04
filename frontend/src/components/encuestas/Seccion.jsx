import { useMemo } from "react";
import Pregunta from "./Pregunta";

export default function Seccion({ seccion, index = 0, totalSecciones = 1, modo = "preview", onFinalizar }) {
  const preguntas = useMemo(() => seccion.Preguntas || [], [seccion]);

  return (
    <div className="card section-card border-0 shadow-sm mb-4">
      <div className="card-body p-md-4">
        {/* encabezado sección */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h6 mb-0">
            <span className="section-pill">{index + 1}</span>
            {seccion.nombre_seccion || `Sección ${index + 1}`}{" "}
            <span className="text-muted">/ {totalSecciones}</span>
          </h2>
          <span className="section-badge">
            {(seccion.Preguntas || []).length} preguntas
          </span>
        </div>

        {/* preguntas */}
        {preguntas.map((p, i) => (
          <Pregunta key={p.id_pregunta ?? i} pregunta={p} index={i + 1} modo={modo} />
        ))}

        {preguntas.length === 0 && (
          <div className="alert alert-warning mb-0">Esta sección no tiene preguntas.</div>
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
