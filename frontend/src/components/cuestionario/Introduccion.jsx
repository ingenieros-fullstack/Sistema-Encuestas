// components/cuestionario/Introduccion.jsx
import { useCallback, useMemo } from "react";

export default function Introduccion({
  titulo,
  texto,
  tiempoLimite,
  onComenzar,
  onVerQR,
  onCancelar,
}) {
  // no-ops seguros
  const noop = () => {};
  const verQR = onVerQR ?? noop;
  const cancelar = onCancelar ?? (() => window.history.back());

  const handleStart = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    onComenzar?.();
  }, [onComenzar]);

  const tiempoHumano = useMemo(() => {
    if (!tiempoLimite) return "Sin límite";
    if (tiempoLimite < 60) return `${tiempoLimite} min`;
    const h = Math.floor(tiempoLimite / 60);
    const m = tiempoLimite % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
  }, [tiempoLimite]);

  return (
    <div className="preview-hero text-center py-4 px-3">
      <h2 className="mb-2 fw-bold display-6 text-white-imp">
        {titulo || "Cuestionario"}
      </h2>

      {texto && (
        <p className="mb-3 lead text-white-imp" style={{ whiteSpace: "pre-wrap" }}>
          {texto}
        </p>
      )}

      <div className="mb-3">
        <span className="badge rounded-pill chip-white-imp" aria-label={`Tiempo límite: ${tiempoHumano}`}>
          ⏳ {tiempoHumano}
        </span>
      </div>

      <div className="d-flex flex-wrap justify-content-center gap-2 mt-1">
        <button
          type="button"
          onClick={handleStart}
          className="btn btn-gradient btn-lg"
          aria-label="Comenzar cuestionario"
        >
          Comenzar
        </button>

        <button
          type="button"
          onClick={verQR}
          className="btn btn-gradient btn-lg"
          aria-label="Ver código QR"
        >
          Ver QR
        </button>

        <button
          type="button"
          onClick={cancelar}
          className="btn btn-gradient btn-lg"
          aria-label="Cancelar"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
