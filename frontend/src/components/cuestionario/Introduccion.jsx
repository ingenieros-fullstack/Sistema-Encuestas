export default function Introduccion({ titulo, texto, tiempoLimite, onComenzar }) {
  return (
    <div className="text-center p-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">{titulo}</h2>

      {texto && <p className="mb-4 text-gray-600">{texto}</p>}

      {tiempoLimite && (
        <p className="mb-4 text-gray-500 flex items-center justify-center gap-2">
          ⏳ Tienes {tiempoLimite} minutos para responder este cuestionario
        </p>
      )}

      <button
        onClick={onComenzar}
        className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Comenzar
      </button>
    </div>
  );
}
