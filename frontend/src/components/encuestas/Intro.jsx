export default function Intro({ titulo, introduccion, tiempoLimite, onComenzar }) {
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">{titulo}</h1>

      {introduccion && (
        <p className="mb-4 text-gray-700">{introduccion}</p>
      )}

      {tiempoLimite && (
        <p className="mb-6 text-red-600 font-semibold">
          ⏳ Tienes {tiempoLimite} minutos para responder esta encuesta
        </p>
      )}

      <button
        onClick={onComenzar}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
      >
        Comenzar
      </button>
    </div>
  );
}
