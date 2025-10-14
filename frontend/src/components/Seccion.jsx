import Pregunta from "./Pregunta";

export default function Seccion({ seccion, modo, respuestas, onResponder }) {
  return (
    <div className="mb-6 border rounded-lg p-4 bg-gray-50 shadow">
      <h2 className="text-lg font-semibold text-indigo-700 mb-3">
        {seccion.nombre_seccion || "Sección"}
      </h2>
      {seccion.Pregunta?.map((pregunta, idx) => (
        <Pregunta
          key={pregunta.id_pregunta || idx}
          pregunta={pregunta}
          modo={modo}
          respuesta={respuestas ? respuestas[pregunta.id_pregunta] : ""}
          onResponder={onResponder}
        />
      ))}
    </div>
  );
}
