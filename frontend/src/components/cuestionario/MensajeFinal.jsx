// components/cuestionario/MensajeFinal.jsx
import { useMemo } from "react";

/**
 * Props:
 * - texto, aprobado, puntajeTotal, umbral
 * - aciertos, totalPreguntas, tiempoEmpleadoMin  (opc.)
 * - onResolver, onVolver, onVerQR               (opc.)
 */
export default function MensajeFinal({
  texto,
  aprobado,
  puntajeTotal = 0,
  umbral = 0,
  aciertos,
  totalPreguntas,
  tiempoEmpleadoMin,
  onResolver,
  onVolver,
  onVerQR,
}) {
  const cfg = useMemo(() => {
    if (typeof aprobado === "undefined") {
      return { color: "#0ea5e9", chip: "Resultado", title: "Vista previa finalizada", icon: "info" };
    }
    return aprobado
      ? { color: "#16a34a", chip: "Aprobado", title: "¡Felicidades! Has aprobado el cuestionario", icon: "check" }
      : { color: "#dc2626", chip: "No aprobado", title: "No alcanzaste el umbral. ¡Sigue intentando!", icon: "x" };
  }, [aprobado]);

  // Progreso relativo al umbral para el anillo (si hay umbral)
  const progress = useMemo(() => {
    if (umbral > 0) return Math.max(0, Math.min(100, Math.round((puntajeTotal / umbral) * 100)));
    return 100;
  }, [puntajeTotal, umbral]);

  const stats = [
    { icon: "🏆", label: "Puntaje", value: String(puntajeTotal) },
    typeof umbral !== "undefined" && { icon: "🎯", label: "Umbral", value: String(umbral) },
    typeof aciertos !== "undefined" && typeof totalPreguntas !== "undefined" && {
      icon: "✅", label: "Aciertos", value: `${aciertos}/${totalPreguntas}`,
    },
    typeof tiempoEmpleadoMin !== "undefined" && {
      icon: "⏱️", label: "Tiempo",
      value: tiempoEmpleadoMin < 60 ? `${tiempoEmpleadoMin} min` : `${Math.floor(tiempoEmpleadoMin / 60)} h ${tiempoEmpleadoMin % 60} min`,
    },
  ].filter(Boolean);

  return (
    <section className="final-wrap">
      <article className="final-card">
        {/* Hero */}
        <header className="final-hero">
          <span
            className="final-chip"
            style={{ color: cfg.color, borderColor: `${cfg.color}40`, background: `${cfg.color}14` }}
          >
            <span className="dot" style={{ background: cfg.color }} />
            {cfg.chip}
          </span>

          <div
            className="final-badge"
            style={{ ["--final-color"]: cfg.color, ["--final-progress"]:`${progress}%` }}
            aria-label={`Progreso ${progress}%`}
          >
            {cfg.icon === "check" ? (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : cfg.icon === "x" ? (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16.5" r="1" fill="currentColor"/>
              </svg>
            )}
          </div>

          <h2 className="final-title" style={{ color: cfg.color }}>
            {cfg.title}
          </h2>

          {texto && (
            <p className="final-sub text-muted" style={{ whiteSpace: "pre-wrap" }}>
              {texto}
            </p>
          )}
        </header>

        {/* Métricas */}
        {stats.length > 0 && (
          <section className="final-stats" role="group" aria-label="Resumen">
            {stats.map((s, i) => (
              <div className="fstat" key={i}>
                <div className="ico">{s.icon}</div>
                <div className="val">{s.value}</div>
                <div className="lab">{s.label}</div>
              </div>
            ))}
          </section>
        )}

        {/* Acciones */}
        <footer className="final-actions">
          {typeof onResolver === "function" && (
            <button type="button" className="btn btn-gradient" onClick={onResolver}>
              🚀 Resolver cuestionario
            </button>
          )}
          {typeof onVolver === "function" && (
            <button type="button" className="btn btn-outline-secondary" onClick={onVolver}>
              ← Volver a la portada
            </button>
          )}
          {typeof onVerQR === "function" && (
            <button type="button" className="btn btn-outline-dark" onClick={onVerQR}>
              Ver QR
            </button>
          )}
        </footer>
      </article>
    </section>
  );
}
