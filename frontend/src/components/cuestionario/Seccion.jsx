import Pregunta from "./Pregunta";

const getQuestions = (sec) => {
  if (!sec) return [];
  return (
    sec.Preguntas ||
    sec.Pregunta ||
    sec.preguntas ||
    []
  );
};

export default function Seccion({
  seccion,
  modo = "preview",
  respuestas = {},
  onResponder,
  onFinalizar,
}) {
  const preguntas = getQuestions(seccion);

  return (
    <section className="form-section">
      <header className="form-section-header">
        <div className="form-section-title">
          <div>
            <h2>{seccion?.nombre_seccion || "Sección sin título"}</h2>
            {seccion?.descripcion && (
              <p className="form-section-desc">{seccion.descripcion}</p>
            )}
          </div>
        </div>
      </header>

      <div className="form-section-body">
        {preguntas.length ? (
          preguntas.map((pregunta, i) => (
            <Pregunta
              key={pregunta.id_pregunta ?? i}
              pregunta={pregunta}
              idx={i}
              modo={modo}
              respuestas={respuestas}
              onResponder={onResponder}
            />
          ))
        ) : (
          <div className="form-empty">
            <p>⚠️ No hay preguntas en esta sección.</p>
          </div>
        )}
      </div>

      {onFinalizar && (
        <footer className="form-section-footer">
          <button onClick={onFinalizar} className="btn-primary">
            Finalizar sección
          </button>
        </footer>
      )}
    </section>
  );
}
