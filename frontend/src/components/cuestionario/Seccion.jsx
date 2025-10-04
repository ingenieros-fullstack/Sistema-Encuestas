import Pregunta from "./Pregunta";

export default function Seccion({ seccion, modo = "preview", onFinalizar }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-indigo-700">
        {seccion?.nombre_seccion || "Sección"}
      </h2>

      {Array.isArray(seccion?.Preguntas) && seccion.Preguntas.length > 0 ? (
        seccion.Preguntas.map((pregunta, i) => (
          <Pregunta
            key={pregunta.id_pregunta ?? i}
            pregunta={pregunta}
            modo={modo}
            idx={i}
          />
        ))
      ) : (
        <p className="text-gray-500">No hay preguntas en esta sección.</p>
      )}

      {onFinalizar && (
        <div className="text-end mt-5">
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
