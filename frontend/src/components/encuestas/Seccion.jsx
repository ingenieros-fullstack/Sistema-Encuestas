import { useState } from "react";
import Pregunta from "./Pregunta";

export default function Seccion({ seccion, modo = "preview", onRespuesta, onFinalizar }) {
  const [indice, setIndice] = useState(0); // índice de bloque de preguntas
  const preguntas = seccion.Preguntas || [];
  const totalBloques = Math.ceil(preguntas.length / 2);

  const handleSiguiente = () => {
    if (indice < totalBloques - 1) {
      setIndice(indice + 1);
    } else if (onFinalizar) {
      onFinalizar();
    }
  };

  const handleAnterior = () => {
    if (indice > 0) setIndice(indice - 1);
  };

  const preguntasVisibles = preguntas.slice(indice * 2, indice * 2 + 2);

  return (
    <div className="p-6 border rounded-lg mb-6 bg-white shadow-sm">
      <h2 className="text-lg font-bold mb-2">{seccion.nombre_seccion}</h2>
      <p className="text-gray-600 mb-4">{seccion.tema}</p>

      {preguntasVisibles.map((pregunta) => (
        <Pregunta
          key={pregunta.id_pregunta}
          pregunta={pregunta}
          modo={modo}
          onRespuesta={onRespuesta}
        />
      ))}

      {/* Navegación entre bloques */}
      <div className="flex justify-between mt-6">
        {indice > 0 && (
          <button
            onClick={handleAnterior}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Anterior
          </button>
        )}
        <button
          onClick={handleSiguiente}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded ml-auto"
        >
          {indice < totalBloques - 1 ? "Siguiente" : "Finalizar sección"}
        </button>
      </div>
    </div>
  );
}
