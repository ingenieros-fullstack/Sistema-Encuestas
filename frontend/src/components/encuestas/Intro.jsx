export default function Intro({ titulo, introduccion, tiempoLimite, totalSecciones, codigo, onComenzar, onVerQR, onCancelar }) {
  const tiempoTxt = tiempoLimite ? `${tiempoLimite} min` : "Sin límite";

  return (
    <section className="cover cover--deep glass shadow-lg preview-hero">
      <div className="cover-badges">
        <span className="metric-chip">⏱️ {tiempoTxt}</span>
        <span className="metric-chip">📚 {totalSecciones} secciones</span>
        {codigo && <span className="metric-chip">#{codigo}</span>}
      </div>

      <h1 className="display-6 fw-semibold mb-2 text-center">{titulo}</h1>
      <p className="lead text-center mb-4">{introduccion || "Revisa y prueba antes de publicar."}</p>

      <div className="d-flex flex-wrap justify-content-center gap-2">
        <button className="btn btn-gradient btn-lg px-4" onClick={onComenzar}>Comenzar</button>
        <button className="btn btn-outline-light-imp btn-lg" onClick={onVerQR}>Ver QR</button>
        <button className="btn btn-outline-light-imp btn-lg" onClick={onCancelar}>Cancelar</button>
      </div>
    </section>
  );
}
