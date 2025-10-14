import React, { useMemo } from "react";

/* ================= Helpers ================= */

function parseOpciones(raw) {
  if (Array.isArray(raw)) {
    return raw.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (raw == null) return [];
  return String(raw)
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizaRC(rcRaw, tipo, opciones) {
  if (rcRaw == null) return [];

  const many = Array.isArray(rcRaw)
    ? rcRaw.map(String)
    : String(rcRaw)
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);

  if (tipo === "si_no") {
    if (!many.length) return [];
    const v = many[0].toLowerCase();
    if (["si", "sí", "true", "1"].includes(v)) return ["Sí"];
    if (["no", "false", "0"].includes(v)) return ["No"];
    return [many[0]];
  }

  if (tipo === "escala_1_5") return many;

  if (tipo === "seleccion_unica" || tipo === "opcion_multiple") {
    return many.map((tok) => {
      const idx = Number(tok);
      if (Number.isInteger(idx) && idx >= 0 && idx < (opciones?.length ?? 0)) {
        return String(opciones[idx]);
      }
      if (opciones?.includes(tok)) return tok;
      return tok;
    });
  }

  return many;
}

/* ================ Componente ================ */

export default function Pregunta({ pregunta = {}, idx = 0, modo = "preview" }) {
  const {
    enunciado = "",
    tipo_pregunta = "respuesta_corta",
    puntaje = 0,
    opciones: rawOpciones = "",
    respuesta_correcta: rcRaw = "",
  } = pregunta || {};

  const opciones = useMemo(() => parseOpciones(rawOpciones), [rawOpciones]);
  const rc = useMemo(
    () => normalizaRC(rcRaw, tipo_pregunta, opciones),
    [rcRaw, tipo_pregunta, opciones]
  );

  const isPreview = modo === "preview";

  /* ------------ UI por tipo ------------ */
  const UIRespuestaCorta = () => (
    <input
      className="q-input"
      placeholder="Tu respuesta..."
      disabled
      readOnly
    />
  );

  const UISiNo = () => (
    <div className="q-options">
      <div className="q-option">
        <input type="radio" disabled />
        <label>Sí</label>
      </div>
      <div className="q-option">
        <input type="radio" disabled />
        <label>No</label>
      </div>
    </div>
  );

  const UISeleccionUnica = () => (
    <div className="q-options">
      {opciones.length ? (
        opciones.map((opt, i) => (
          <div key={i} className="q-option">
            <input type="radio" disabled />
            <label>
              <span className="q-letter">{String.fromCharCode(65 + i)}.</span>{" "}
              {opt}
            </label>
          </div>
        ))
      ) : (
        <p className="text-muted">Sin opciones</p>
      )}
    </div>
  );

  const UIOpcionMultiple = () => (
    <div className="q-options">
      {opciones.length ? (
        opciones.map((opt, i) => (
          <div key={i} className="q-option">
            <input type="checkbox" disabled />
            <label>{opt}</label>
          </div>
        ))
      ) : (
        <p className="text-muted">Sin opciones</p>
      )}
    </div>
  );

  const UIEscala = () => (
    <div className="q-options q-scale">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="q-option scale">
          <input type="radio" disabled />
          <label>{n}</label>
        </div>
      ))}
    </div>
  );

  const renderByTipo = () => {
    switch (tipo_pregunta) {
      case "respuesta_corta":
        return <UIRespuestaCorta />;
      case "si_no":
        return <UISiNo />;
      case "seleccion_unica":
        return <UISeleccionUnica />;
      case "opcion_multiple":
        return <UIOpcionMultiple />;
      case "escala_1_5":
        return <UIEscala />;
      default:
        return <p className="text-muted">Tipo no soportado</p>;
    }
  };

  return (
    <div className="q-card">
      {/* Encabezado */}
      <div className="q-header">
        <div className="q-header-left">
          <span className="q-index">{idx + 1}</span>
          <span className="q-title">{enunciado || "Pregunta"}</span>
        </div>
        <div className="q-header-right">
          <span className="q-type">
            {tipo_pregunta.replaceAll("_", " ")}
          </span>
          <span className="q-points">⭐ {puntaje ?? 0}</span>
        </div>
      </div>

      {/* Cuerpo de la pregunta */}
      <div className="q-body">{renderByTipo()}</div>

      {/* Respuesta correcta (solo preview) */}
      {isPreview && (
        <div className="q-answer mt-2">
          <strong>Respuesta correcta:</strong>{" "}
          {rc.length ? (
            rc.map((t, i) => (
              <span key={i} className="q-correct-chip">
                {t}
              </span>
            ))
          ) : (
            <span className="text-muted">—</span>
          )}
        </div>
      )}
    </div>
  );
}
