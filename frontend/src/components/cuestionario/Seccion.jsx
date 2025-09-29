import Pregunta from "./Pregunta";

export default function Seccion({ seccion, modo, onFinalizar }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3 text-indigo-700">
        {seccion.nombre_seccion}
      </h2>

      {seccion.Preguntas?.length > 0 ? (
        seccion.Preguntas.map((pregunta) => (
          <Pregunta
            key={pregunta.id_pregunta}
            pregunta={pregunta}
            modo={modo}
          />
        ))
      ) : (
        <p className="text-gray-500">No hay preguntas en esta sección.</p>
      )}

      {onFinalizar && (
        <div className="text-end mt-4">
          <button
            onClick={onFinalizar}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Finalizar
          </button>
        </div>
      )}
    </div>
  );
}
