// src/components/cuestionario/Pregunta.jsx
import React, { useMemo } from "react";

/* ================= Helpers ================= */

function parseOpciones(raw) {
  // Acepta string "A;B;C" o array; limpia y filtra vacíos
  if (Array.isArray(raw)) {
    return raw.map(String).map(s => s.trim()).filter(Boolean);
  }
  if (raw == null) return [];
  return String(raw)
    .split(";")
    .map(s => s.trim())
    .filter(Boolean);
}

// Devuelve la respuesta correcta normalizada a texto(s)
function normalizaRC(rcRaw, tipo, opciones) {
  if (rcRaw == null) return [];

  // Múltiple puede venir "A;B" o array
  const many = Array.isArray(rcRaw)
    ? rcRaw.map(String)
    : String(rcRaw).split(";").map(s => s.trim()).filter(Boolean);

  // Sí/No
  if (tipo === "si_no") {
    if (!many.length) return [];
    const v = many[0].toLowerCase();
    if (v === "si" || v === "sí" || v === "true" || v === "1") return ["Sí"];
    if (v === "no" || v === "false" || v === "0") return ["No"];
    return [many[0]];
  }

  // Escala 1–5
  if (tipo === "escala_1_5") return many;

  // Selección única / Opción múltiple
  if (tipo === "seleccion_unica" || tipo === "opcion_multiple") {
    return many.map(tok => {
      // índice → opción
      const idx = Number(tok);
      if (
        Number.isInteger(idx) &&
        idx >= 0 &&
        idx < (opciones?.length ?? 0)
      ) {
        return String(opciones[idx]);
      }
      // si viene texto, se respeta si coincide con alguna opción
      if (opciones?.includes(tok)) return tok;
      return tok; // fallback
    });
  }

  // Respuesta corta u otros
  return many;
}

/* ================ Componente ================ */

export default function Pregunta({
  pregunta = {},
  idx = 0,
  modo = "preview",
}) {
  const {
    enunciado = "",
    tipo_pregunta = "respuesta_corta",
    puntaje = 0,
    opciones: rawOpciones = "",
    respuesta_correcta: rcRaw = "",
  } = pregunta || {};

  const opciones = useMemo(
    () => parseOpciones(rawOpciones),
    [rawOpciones]
  );

  const rc = useMemo(
    () => normalizaRC(rcRaw, tipo_pregunta, opciones),
    [rcRaw, tipo_pregunta, opciones]
  );

  const isPreview = modo === "preview";

  /* ------------ UI por tipo ------------ */
  const UIRespuestaCorta = () => (
    <input
      className="form-control"
      placeholder="Tu respuesta..."
      disabled
    />
  );

  const UISiNo = () => (
    <div className="d-flex gap-2">
      <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
        Sí
      </button>
      <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
        No
      </button>
    </div>
  );

  const UISeleccionUnica = () => (
    <>
      {opciones.length ? (
        <div className="list-group">
          {opciones.map((opt, i) => (
            <label key={i} className="list-group-item d-flex align-items-center gap-2">
              <input type="radio" className="form-check-input m-0" disabled />
              <span>
                <span className="badge text-bg-light me-2">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <div className="text-muted">Sin opciones</div>
      )}
    </>
  );

  const UIOpcionMultiple = () => (
    <>
      {opciones.length ? (
        <div className="list-group">
          {opciones.map((opt, i) => (
            <label key={i} className="list-group-item d-flex align-items-center gap-2">
              <input type="checkbox" className="form-check-input m-0" disabled />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="text-muted">Sin opciones</div>
      )}
    </>
  );

  const UIEscala = () => (
    <div className="d-flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" className="btn btn-outline-secondary btn-sm" disabled>
          {n}
        </button>
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
        return <div className="text-muted">Tipo no soportado</div>;
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        {/* encabezado */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge rounded-pill text-bg-primary">{idx + 1}</span>
            <h5 className="card-title mb-0">{enunciado || "Pregunta"}</h5>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <span className="badge text-bg-light text-capitalize">
              {tipo_pregunta.replace("_", " ").replace("_", " ")}
            </span>
            <span className="badge text-bg-secondary">
              ⭐ {puntaje ?? 0}
            </span>
          </div>
        </div>

        {/* controles (preview deshabilitado) */}
        <div className="mb-3">{renderByTipo()}</div>

        {/* Respuesta correcta en PREVIEW */}
        {isPreview && (
          <div className="p-3 rounded border bg-success-subtle border-success-subtle">
            <div className="fw-semibold mb-1">Respuesta correcta:</div>
            {rc.length ? (
              <div className="d-flex flex-wrap gap-2">
                {rc.map((t, i) => (
                  <span key={i} className="badge text-bg-success">{t}</span>
                ))}
              </div>
            ) : (
              <span className="text-muted">—</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
