import React, { useState, useEffect } from "react";

export default function EditarPreguntaModal({
  modalEditarPregunta,
  setModalEditarPregunta,
  guardarEdicionPregunta,
}) {
  if (!modalEditarPregunta) return null;

  const [form, setForm] = useState({
    enunciado: "",
    tipo_pregunta: "respuesta_corta",
    obligatoria: false,
    opciones: [],
  });
  const [nuevaOpcion, setNuevaOpcion] = useState("");

  useEffect(() => {
    setForm({
      enunciado: modalEditarPregunta.enunciado || "",
      tipo_pregunta: modalEditarPregunta.tipo_pregunta || "respuesta_corta",
      obligatoria: modalEditarPregunta.obligatoria || false,
      opciones: modalEditarPregunta.Opciones?.map((o) => o.texto) || [],
    });
  }, [modalEditarPregunta]);

  const agregarOpcion = () => {
    const val = nuevaOpcion.trim();
    if (!val) return;
    if (form.opciones.includes(val)) return;
    setForm({ ...form, opciones: [...form.opciones, val] });
    setNuevaOpcion("");
  };

  const eliminarOpcion = (idx) => {
    setForm({
      ...form,
      opciones: form.opciones.filter((_, i) => i !== idx),
    });
  };

  const handleGuardar = () => {
    guardarEdicionPregunta(form);
  };

  const requiereOpciones =
    form.tipo_pregunta === "opcion_multiple" ||
    form.tipo_pregunta === "seleccion_unica";

  const esCondicional = form.tipo_pregunta === "condicional";

  return (
    <div className="gs2-modal">
      <div className="gs2-modal-content" style={{ maxWidth: 500 }}>
        <h3>Editar Pregunta</h3>

        {/* 🔹 Enunciado */}
        <div className="gs2-form-row">
          <label>Enunciado</label>
          <input
            className="gs2-input"
            value={form.enunciado}
            onChange={(e) => setForm({ ...form, enunciado: e.target.value })}
          />
        </div>

        {/* 🔹 Tipo de respuesta */}
        <div className="gs2-form-row">
          <label>Tipo de respuesta</label>
          <div className="gs2-segmented">
            {[
              ["respuesta_corta", "Corta"],
              ["opcion_multiple", "Múltiple"],
              ["seleccion_unica", "Única"],
              ["si_no", "Sí/No"],
              ["escala_1_5", "Escala 1–5"],
              ["condicional", "Condicional"],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setForm({ ...form, tipo_pregunta: val })}
                className={
                  "gs2-seg-item " + (form.tipo_pregunta === val ? "active" : "")
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
            className={"gs2-switch " + (form.obligatoria ? "on" : "off")}
            onClick={() =>
              setForm({ ...form, obligatoria: !form.obligatoria })
            }
          >
            <span className="knob" />
          </button>
        </div>

        {/* 🔹 Opciones si aplica */}
        {requiereOpciones && (
          <div className="gs2-block mt-2">
            <details open className="gs2-details">
              <summary>Opciones</summary>

              <div className="gs2-inline">
                <input
                  className="gs2-input flex-1"
                  placeholder="Escribe una opción..."
                  value={nuevaOpcion}
                  onChange={(e) => setNuevaOpcion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && agregarOpcion()}
                />
                <button className="gs2-btn" onClick={agregarOpcion}>
                  Añadir
                </button>
              </div>

              <div className="gs2-chips">
                {form.opciones.map((op, i) => (
                  <span className="gs2-chip" key={i}>
                    {op}
                    <button className="x" onClick={() => eliminarOpcion(i)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* 🔹 Información sobre preguntas condicionales */}
        {esCondicional && (
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
              Este tipo de pregunta sirve para activar una sección específica si
              la respuesta del usuario es “Sí”. La relación se configura desde
              el panel de <strong>Secciones</strong>.
            </p>
          </div>
        )}

        {/* 🔹 Botones de acción */}
        <div className="gs2-modal-actions">
          <button
            className="gs2-btn"
            onClick={() => setModalEditarPregunta(null)}
          >
            Cancelar
          </button>
          <button className="gs2-btn gs2-btn-success" onClick={handleGuardar}>
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
