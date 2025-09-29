import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Intro from "../../components/encuestas/Intro";
import Seccion from "../../components/encuestas/Seccion";
import MensajeFinal from "../../components/encuestas/MensajeFinal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ResolverEncuestaAdmin() {
  const { codigo } = useParams();
  const [encuesta, setEncuesta] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [error, setError] = useState("");
  const [mostrarIntro, setMostrarIntro] = useState(true);
  const [finalizado, setFinalizado] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/admin/encuestas/${codigo}/preview`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar encuesta");
        return res.json();
      })
      .then((data) => setEncuesta(data))
      .catch((err) => {
        console.error("❌ Error cargando encuesta:", err);
        setError("No se pudo cargar la encuesta. Verifica si existe.");
      });
  }, [codigo]);

  const handleRespuesta = (id_pregunta, valor) => {
    setRespuestas((prev) => ({ ...prev, [id_pregunta]: valor }));
  };

  const enviarRespuestas = async () => {
    // ⚠️ En modo admin no enviamos nada al backend
    alert("⚠️ Modo Admin: respuestas no se guardan, solo es una prueba ✅");
    setFinalizado(true);
  };

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!encuesta) {
    return <p className="p-6">⏳ Cargando encuesta...</p>;
  }

  // 👉 Pantalla de introducción
  if (mostrarIntro) {
    return (
      <Intro
        titulo={encuesta.titulo}
        introduccion={encuesta.introduccion}
        tiempoLimite={encuesta.tiempo_limite}
        onComenzar={() => setMostrarIntro(false)}
      />
    );
  }

  // 👉 Pantalla final
  if (finalizado) {
    return (
      <MensajeFinal
        textoFinal={
          encuesta.texto_final || "Has terminado la prueba de esta encuesta."
        }
      />
    );
  }

  // 👉 Pantalla de encuesta
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{encuesta.titulo}</h1>

      {encuesta.Secciones?.map((seccion, idx) => (
        <Seccion
          key={seccion.id_seccion}
          seccion={seccion}
          modo="responder"
          onRespuesta={handleRespuesta}
          onFinalizar={
            idx === encuesta.Secciones.length - 1 ? enviarRespuestas : null
          }
        />
      ))}

      <div className="flex justify-center mt-8">
        <button
          onClick={enviarRespuestas}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded shadow-md"
        >
          Enviar Encuesta (Prueba Admin)
        </button>
      </div>
    </div>
  );
}
