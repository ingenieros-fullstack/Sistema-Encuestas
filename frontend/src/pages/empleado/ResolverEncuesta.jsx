import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Intro from "../../components/encuestas/Intro";
import Seccion from "../../components/encuestas/Seccion";
import MensajeFinal from "../../components/encuestas/MensajeFinal";

export default function ResolverEncuestaEmpleado() {
  const { codigo } = useParams(); // ruta: /empleado/encuestas/:codigo
  const [encuesta, setEncuesta] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [step, setStep] = useState("intro"); // intro | secciones | final
  const [seccionActual, setSeccionActual] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/empleado/encuestas/${codigo}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then((data) => setEncuesta(data))
      .catch((err) => console.error("Error cargando encuesta:", err));
  }, [codigo]);

  const handleRespuesta = (id_pregunta, valor) => {
    setRespuestas((prev) => ({ ...prev, [id_pregunta]: valor }));
  };

  const handleFinalizarSeccion = () => {
    if (seccionActual < encuesta.Seccions.length - 1) {
      setSeccionActual(seccionActual + 1);
    } else {
      enviarFormulario();
    }
  };

  const enviarFormulario = async () => {
    const body = {
      respuestas: Object.entries(respuestas).map(([id_pregunta, respuesta]) => ({
        id_pregunta,
        respuesta
      }))
    };

    const res = await fetch(`/empleado/encuestas/${codigo}/responder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      setStep("final");
    } else {
      alert("❌ Error al enviar encuesta");
    }
  };

  if (!encuesta) return <p>Cargando encuesta...</p>;

  if (step === "intro") {
    return (
      <Intro
        titulo={encuesta.titulo}
        introduccion={encuesta.introduccion}
        tiempoLimite={encuesta.tiempo_limite}
        onComenzar={() => setStep("secciones")}
      />
    );
  }

  if (step === "final") {
    return <MensajeFinal textoFinal={encuesta.texto_final} />;
  }

  const seccion = encuesta.Seccions[seccionActual];
  return (
    <div className="p-6">
      <Seccion
        seccion={seccion}
        modo="responder"
        onRespuesta={handleRespuesta}
        onFinalizar={handleFinalizarSeccion}
      />
    </div>
  );
}
