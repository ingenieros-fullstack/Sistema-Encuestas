import Pregunta from "./Pregunta";

const getQuestions = (sec) => sec?.Preguntas || sec?.Pregunta || sec?.preguntas || [];

export default function Seccion({ seccion, modo = "preview", idx = 0, total = 1 }) {
  const preguntas = getQuestions(seccion);

  return (
    <div className="card section-card shadow-sm border-0 mb-4">
      <div className="card-body p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h6 mb-0">
            <span className="section-pill">{idx + 1}</span>
            Sección {idx + 1} / {total}
          </h2>
          <span className="badge text-bg-secondary">
            {preguntas.length} {preguntas.length === 1 ? "pregunta" : "preguntas"}
          </span>
        </div>

        {preguntas.length ? (
          preguntas.map((p, i) => (
            <Pregunta key={p.id_pregunta ?? p.id ?? i} pregunta={p} index={i + 1} modo={modo} />
          ))
        ) : (
          <div className="alert alert-warning mb-0">No hay preguntas en esta sección.</div>
        )}
      </div>
    </div>
  );
}
