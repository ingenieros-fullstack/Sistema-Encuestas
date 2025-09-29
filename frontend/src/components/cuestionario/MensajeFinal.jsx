export default function MensajeFinal({ texto, aprobado, puntajeTotal, umbral }) {
  return (
    <div className="mt-6 p-6 rounded-lg shadow bg-gray-50 text-center">
      {texto && <p className="mb-3 text-gray-700">{texto}</p>}

      {aprobado !== undefined && (
        <div className="space-y-2">
          <p className={`font-bold ${aprobado ? "text-green-600" : "text-red-600"}`}>
            {aprobado
              ? "¡Felicidades! Has aprobado el cuestionario 🎉"
              : "No aprobaste el cuestionario. Inténtalo de nuevo."}
          </p>

          {umbral !== undefined && (
            <p className="text-gray-600">
              Tu calificación fue <strong>{puntajeTotal}</strong>.  
              Para aprobar necesitabas al menos <strong>{umbral}</strong>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
