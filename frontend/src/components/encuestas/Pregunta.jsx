import React from "react";

export default function Pregunta({
  pregunta,
  index = 1,
  modo = "preview",
  respuestas = {},
  onRespuesta,
}) {
  const disabled = modo === "preview";
  const opciones = pregunta?.Opciones || [];
  const id = pregunta?.id_pregunta;
  const tipo = (pregunta?.tipo_pregunta || "").toLowerCase();
  const valor = respuestas[id];

  const getOpValue = (op) =>
    op?.valor ?? op?.value ?? op?.id_opcion ?? op?.texto_opcion ?? op?.texto ?? op;

  const getOpLabel = (op) =>
    op?.texto_opcion ?? op?.texto ?? String(getOpValue(op));

  const canonYN = (v) => {
    const s = String(v ?? "").trim().toLowerCase();
    if (["si", "sí", "yes", "true", "1", "y"].includes(s)) return "si";
    if (["no", "false", "0", "n"].includes(s)) return "no";
    return s;
  };

  const setValor = (v) => {
    if (disabled || !id) return;
    if (tipo === "si_no" || tipo === "condicional") {
      onRespuesta && onRespuesta(id, canonYN(v));
    } else {
      onRespuesta && onRespuesta(id, v);
    }
  };

  const toggleMultiple = (opValue) => {
    if (disabled) return;
    const prev = Array.isArray(valor) ? valor : [];
    onRespuesta &&
      onRespuesta(
        id,
        prev.includes(opValue) ? prev.filter((x) => x !== opValue) : [...prev, opValue]
      );
  };

  const TipoChip = ({ children }) => (
    <span className="q-type text-capitalize">{children}</span>
  );

  const renderSiNo = () => (
    <div className="q-options">
      {[
        { v: "si", label: "Sí" },
        { v: "no", label: "No" },
      ].map(({ v, label }) => (
        <label key={v} className="q-option">
          <input
            type="radio"
            className="form-check-input m-0"
            name={`p-${id}`}
            disabled={disabled}
            checked={canonYN(valor) === v}
            onChange={() => setValor(v)}
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );

  const renderCondicional = () => {
    // Si la API trae opciones, las usamos; si no, cae a Sí/No
    if (opciones.length > 0) {
      return (
        <div className="q-options">
          {opciones.map((op, i) => {
            const raw = getOpValue(op);
            const v = canonYN(raw) || String(raw).toLowerCase();
            const label = getOpLabel(op) || (v === "si" ? "Sí" : v === "no" ? "No" : String(raw));
            return (
              <label key={i} className="q-option">
                <input
                  type="radio"
                  className="form-check-input m-0"
                  name={`p-${id}`}
                  disabled={disabled}
                  checked={canonYN(valor) === v}
                  onChange={() => setValor(v)}
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      );
    }
    return renderSiNo();
  };

  const renderRespuestaCorta = () => (
    <>
      <input
        type="text"
        className="form-control q-input"
        placeholder="Tu respuesta…"
        disabled={disabled}
        value={valor ?? ""}
        onChange={(e) => setValor(e.target.value)}
      />
      {disabled && <div className="small text-secondary mt-2">Vista previa (bloqueado)</div>}
    </>
  );

  const renderSeleccionUnica = () => (
    <div className="q-options">
      {opciones.map((op, i) => {
        const opValue = getOpValue(op);
        const opLabel = getOpLabel(op);
        return (
          <label key={i} className="q-option">
            <input
              type="radio"
              className="form-check-input m-0"
              name={`p-${id}`}
              disabled={disabled}
              checked={valor === opValue}
              onChange={() => setValor(opValue)}
            />
            <span>
              <span className="badge text-bg-light me-2">{String.fromCharCode(65 + i)}</span>
              {opLabel}
            </span>
          </label>
        );
      })}
      {disabled && <div className="small text-secondary mt-2">Vista previa (bloqueado)</div>}
    </div>
  );

  const renderOpcionMultiple = () => (
    <div className="q-options">
      {opciones.map((op, i) => {
        const opValue = getOpValue(op);
        const opLabel = getOpLabel(op);
        const checked = Array.isArray(valor) && valor.includes(opValue);
        return (
          <label key={i} className="q-option">
            <input
              type="checkbox"
              className="form-check-input m-0"
              disabled={disabled}
              checked={!!checked}
              onChange={() => toggleMultiple(opValue)}
            />
            <span>{opLabel}</span>
          </label>
        );
      })}
      {disabled && <div className="small text-secondary mt-2">Vista previa (bloqueado)</div>}
    </div>
  );

  const renderEscala = () => (
    <>
      <div className="d-flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled
          >
            {n}
          </button>
        ))}
      </div>
      {disabled && <div className="small text-secondary mt-2">Vista previa (bloqueado)</div>}
    </>
  );

  const tipoLegible = String(tipo || "").replaceAll("_", " ").replace("  ", " ");

  return (
<div className="q-card mb-3">
  {/* Encabezado */}
  <div className="q-header">
    <div className="q-header-left">
      <span className="q-index">{index}</span>
      <span className="q-title">{pregunta?.enunciado}</span>
    </div>

    {/* chips a la derecha (tipo) */}
    <div className="q-header-right d-flex align-items-center gap-2">
      <span className="q-type text-capitalize">
        {(pregunta?.tipo_pregunta || "").replaceAll("_", " ")}
      </span>
      {/* Si quieres emular también el chip de puntos como en cuestionarios, descomenta:
      <span className="badge text-bg-light">⭐ 0</span>
      */}
    </div>
  </div>

      {/* cuerpo según tipo */}
      <div className="mt-1">
        {tipo === "respuesta_corta" && renderRespuestaCorta()}
        {tipo === "si_no" && renderSiNo()}
        {tipo === "escala_1_5" && renderEscala()}
        {tipo === "seleccion_unica" && opciones.length > 0 && renderSeleccionUnica()}
        {tipo === "opcion_multiple" && opciones.length > 0 && renderOpcionMultiple()}
        {tipo === "condicional" && renderCondicional()}

        {/* fallback tipo desconocido */}
        {[
          "respuesta_corta",
          "si_no",
          "escala_1_5",
          "seleccion_unica",
          "opcion_multiple",
          "condicional",
        ].includes(tipo) || (
          <div className="text-muted">Tipo no soportado</div>
        )}
      </div>
    </div>
  );
}
