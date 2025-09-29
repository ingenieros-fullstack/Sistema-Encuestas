export default function Pregunta({ pregunta, modo }) {
  return (
    <div className="p-4 border rounded mb-3 bg-white shadow-sm">
      <p className="font-medium text-gray-800">{pregunta.enunciado}</p>
      <p className="text-sm text-gray-500">
        Tipo: {pregunta.tipo_pregunta} | Puntaje: {pregunta.puntaje}
      </p>

      {modo === "preview" && (
        <div className="mt-2 text-green-600">
          Respuesta correcta:{" "}
          <strong>{pregunta.respuesta_correcta || "–"}</strong>
        </div>
      )}
    </div>
  );
}
