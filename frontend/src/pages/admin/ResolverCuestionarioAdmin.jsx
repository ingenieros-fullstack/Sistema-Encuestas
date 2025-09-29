import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Seccion from "../../components/Seccion";
import Introduccion from "../../components/cuestionario/Introduccion";
import MensajeFinal from "../../components/cuestionario/MensajeFinal";

export default function ResolverCuestionarioAdmin() {
  const { codigo } = useParams();
  const [cuestionario, setCuestionario] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [finalizado, setFinalizado] = useState(false);
  const [aprobado, setAprobado] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/admin/cuestionarios/${codigo}/preview`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCuestionario(data))
      .catch((err) => console.error("Error cargando cuestionario:", err));
  }, [codigo]);

  const handleRespuesta = (idPregunta, respuesta) => {
    setRespuestas((prev) => ({ ...prev, [idPregunta]: respuesta }));
  };

  const handleFinalizar = () => {
    if (!cuestionario) return;

    let puntajeTotal = 0;
    let puntajeMaximo = 0;

    cuestionario.Seccions.forEach((sec) => {
      sec.Pregunta.forEach((preg) => {
        puntajeMaximo += preg.puntaje || 0;
        if (preg.respuesta_correcta) {
          if (
            respuestas[preg.id_pregunta]?.trim() ===
            preg.respuesta_correcta.trim()
          ) {
            puntajeTotal += preg.puntaje || 0;
          }
        }
      });
    });

    const aprobado =
      cuestionario.umbral_aprobacion && puntajeMaximo > 0
        ? puntajeTotal >= cuestionario.umbral_aprobacion
        : true;

    setAprobado(aprobado);
    setFinalizado(true);
  };

  if (!cuestionario)
    return <p className="text-center mt-10">Cargando cuestionario...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Resolver Cuestionario (Admin)
      </h1>

      {/* Introducción */}
      <Introduccion titulo={cuestionario.titulo} texto={cuestionario.introduccion} />

      {!finalizado ? (
        <>
          {cuestionario.Seccions?.map((sec, idx) => (
            <Seccion
              key={sec.id_seccion || idx}
              seccion={sec}
              modo="resolver"
              respuestas={respuestas}
              onResponder={handleRespuesta}
            />
          ))}

          <button
            onClick={handleFinalizar}
            className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
          >
            Finalizar Cuestionario
          </button>
        </>
      ) : (
        <MensajeFinal texto={cuestionario.texto_final} aprobado={aprobado} />
      )}
    </div>
  );
}
