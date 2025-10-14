import React from "react";

export default function PanelPreguntasSeccion({
  selectedSection,
  filtro,
  setFiltro,
  eliminarPregunta,
  setModalEditarPregunta,
}) {
  return (
    <section className="gs2-pane gs2-middle">
      <div className="gs2-pane-header">
        <div className="gs2-pane-title">
          {selectedSection
            ? `Preguntas · ${selectedSection.nombre_seccion}`
            : "Preguntas"}
        </div>
        <input
          className="gs2-input"
          placeholder="Buscar pregunta…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div className="gs2-pane-body">
        {!selectedSection ? (
          <div className="gs2-empty">Selecciona una sección.</div>
        ) : (
          <ul className="gs2-questions">
            {(selectedSection.Preguntas || [])
              .filter((p) =>
                p.enunciado.toLowerCase().includes(filtro.toLowerCase())
              )
              .map((p) => (
                <li key={p.id_pregunta} className="gs2-q">
                  <div className="gs2-q-title">{p.enunciado}</div>
                  <div className="gs2-q-meta">
                    {/* Tipo de pregunta */}
                    <span className="gs2-tag">{p.tipo_pregunta}</span>

                    {/* Si es obligatoria */}
                    {p.obligatoria && (
                      <span className="gs2-tag warn">obligatoria</span>
                    )}

                    {/* Si es condicional, muestra una etiqueta extra */}
                    {p.tipo_pregunta === "condicional" && (
                      <span className="gs2-tag" style={{ background: "#cffafe", color: "#155e75" }}>
                        condicional
                      </span>
                    )}

                    {/* Botón Editar — ahora también para condicionales */}
                    <button
                      className="gs2-icon"
                      title="Editar"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalEditarPregunta(p);
                      }}
                    >
                      ✎
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      className="gs2-icon danger"
                      title="Eliminar"
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarPregunta(p.id_pregunta);
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  );
}
