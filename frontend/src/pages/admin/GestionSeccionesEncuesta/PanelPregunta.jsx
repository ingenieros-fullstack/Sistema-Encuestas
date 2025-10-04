import React from "react";

export default function PanelPregunta({
  nuevaPregunta,
  setNuevaPregunta,
  nuevaOpcion,
  setNuevaOpcion,
  opciones,
  agregarOpcion,
  eliminarOpcionChip,
  mostrarPegadoMasivo,
  setMostrarPegadoMasivo,
  bloqueOpciones,
  setBloqueOpciones,
  pegarEnBloque,
  crearPregunta,
  puedeCrearPregunta,
  requiereOpciones,
}) {
  return (
    <section className="gs2-pane gs2-right gs2-pane-vertical">
      <div className="gs2-pane-header">
        <div className="gs2-pane-title">Añadir Pregunta</div>
      </div>

      <div className="gs2-pane-body vertical">
        {/* 🔹 Enunciado */}
        <div className="gs2-form-row">
          <label>Enunciado</label>
          <input
            className="gs2-input"
            placeholder="Escribe la pregunta..."
            value={nuevaPregunta.enunciado}
            onChange={(e) =>
              setNuevaPregunta({ ...nuevaPregunta, enunciado: e.target.value })
            }
          />
        </div>

        {/* 🔹 Tipo de respuesta */}
        <div className="gs2-form-row">
          <label>Tipo de respuesta</label>
          <div className="gs2-segmented vertical-wrap">
            {[
              ["respuesta_corta", "Corta"],
              ["opcion_multiple", "Múltiple"],
              ["seleccion_unica", "Única"],
              ["si_no", "Sí/No"],
              ["escala_1_5", "Escala 1–5"],
              ["condicional", "Condicional"], // ✅ tipo especial
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() =>
                  setNuevaPregunta({ ...nuevaPregunta, tipo_pregunta: val })
                }
                className={
                  "gs2-seg-item " +
                  (nuevaPregunta.tipo_pregunta === val ? "active" : "")
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 🔹 Obligatoria */}
        <div className="gs2-form-row">
          <label>Obligatoria</label>
          <button
            className={"gs2-switch " + (nuevaPregunta.obligatoria ? "on" : "off")}
            onClick={() =>
              setNuevaPregunta({
                ...nuevaPregunta,
                obligatoria: !nuevaPregunta.obligatoria,
              })
            }
          >
            <span className="knob" />
          </button>
        </div>

        {/* 🔹 Opciones si aplica */}
        {requiereOpciones && (
          <div className="gs2-block mt-4">
            <details open className="gs2-details">
              <summary>Opciones</summary>

              <div className="gs2-inline">
                <input
                  className="gs2-input flex-1"
                  placeholder="Escribe una opción…"
                  value={nuevaOpcion}
                  onChange={(e) => setNuevaOpcion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && agregarOpcion()}
                />
                <button className="gs2-btn" onClick={agregarOpcion}>
                  Añadir
                </button>
              </div>

              <div className="gs2-chips">
                {opciones.map((op, i) => (
                  <span className="gs2-chip" key={i}>
                    {op}
                    <button className="x" onClick={() => eliminarOpcionChip(i)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <button
                type="button"
                className="gs2-link"
                onClick={() => setMostrarPegadoMasivo((v) => !v)}
              >
                {mostrarPegadoMasivo
                  ? "Ocultar pegado masivo"
                  : "Pegar varias opciones"}
              </button>

              {mostrarPegadoMasivo && (
                <div className="mt-2">
                  <textarea
                    rows={3}
                    className="gs2-input"
                    placeholder="Una por línea o separadas por coma / punto y coma"
                    value={bloqueOpciones}
                    onChange={(e) => setBloqueOpciones(e.target.value)}
                  />
                  <button
                    className="gs2-btn gs2-btn-secondary mt-2"
                    onClick={pegarEnBloque}
                  >
                    Añadir opciones
                  </button>
                </div>
              )}
            </details>
          </div>
        )}

        {/* 🔹 Texto informativo si es condicional */}
        {nuevaPregunta.tipo_pregunta === "condicional" && (
          <div
            className="gs2-details mt-4"
            style={{
              border: "1px dashed var(--line)",
              background: "#f9fbff",
              padding: "12px",
              borderRadius: "10px",
              color: "#334155",
            }}
          >
            <strong>💡 Pregunta condicional</strong>
            <p style={{ fontSize: "13px", marginTop: "4px" }}>
              Este tipo de pregunta permite activar una sección específica si la
              respuesta es “Sí”. Puedes definir qué sección se activa desde el
              panel de <strong>Secciones</strong>.
            </p>
          </div>
        )}
      </div>

      <div className="gs2-pane-footer sticky-footer">
        <button
          className="gs2-btn gs2-btn-success w-100"
          onClick={crearPregunta}
          disabled={!puedeCrearPregunta}
        >
          Crear Pregunta
        </button>
      </div>
    </section>
  );
}
