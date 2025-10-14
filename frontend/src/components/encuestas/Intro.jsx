import React from "react";

export default function Intro({
  titulo = "Encuesta",
  introduccion = "",
  tiempoLimite = null,
  onComenzar,
  onCancelar,
  onVerQR,
  onVerSecciones,
}) {
  return (
    <div className="intro-hero-wrapper">
      {/* capa decorativa */}
      <div className="intro-aurora"></div>
      <div className="intro-grid"></div>

      <header className="container intro-hero">
        <div className="intro-head d-flex gap-2 justify-content-center flex-wrap">
          <span className="chip">
            <span className="chip-dot"></span>
            {tiempoLimite ? `${tiempoLimite} min` : "Sin límite"}
          </span>
          <button
            type="button"
            className="chip chip-ghost d-none d-md-inline-flex"
            onClick={onVerSecciones}
          >
            <span className="chip-dot"></span>
            secciones
          </button>
        </div>

        <h1 className="intro-title text-center">{titulo}</h1>
        {introduccion && (
          <p className="intro-subtitle text-center text-white-50 mb-4">
            {introduccion}
          </p>
        )}

        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <button className="btn btn-neo" onClick={onComenzar}>
            Comenzar
          </button>

          <button
            className="btn btn-neo ghost"
            type="button"
            onClick={onVerQR}
          >
            Ver QR
          </button>

          <button
            className="btn btn-neo link"
            type="button"
            onClick={onCancelar}
          >
            Cancelar
          </button>
        </div>

        <div className="intro-meta d-flex gap-3 justify-content-center mt-4">
          <div className="meta-item">
            <span className="meta-k">Rápida</span>
            <span className="meta-v">~5 min</span>
          </div>
          <div className="meta-item">
            <span className="meta-k">Anonimato</span>
            <span className="meta-v">activo</span>
          </div>
          <div className="meta-item">
            <span className="meta-k">Dispositivo</span>
            <span className="meta-v">móvil/desktop</span>
          </div>
        </div>
      </header>
    </div>
  );
}
