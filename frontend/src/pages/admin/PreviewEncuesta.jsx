import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Intro from "../../components/encuestas/Intro";
import Seccion from "../../components/encuestas/Seccion";
import MensajeFinal from "../../components/encuestas/MensajeFinal";
import { QRCodeCanvas } from "qrcode.react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PreviewEncuesta() {
  const { codigo } = useParams();
  const [encuesta, setEncuesta] = useState(null);
  const [mostrarIntro, setMostrarIntro] = useState(true);
  const [finalizado, setFinalizado] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/admin/encuestas/${codigo}/preview`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar preview");
        return res.json();
      })
      .then((data) => setEncuesta(data))
      .catch((err) => console.error("Error cargando preview:", err));
  }, [codigo]);

  if (!encuesta) return <p>Cargando encuesta...</p>;

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

  if (finalizado) {
    return (
      <div className="p-6 space-y-6">
        <MensajeFinal
          mensajeFinal={
            encuesta.texto_final || "Has terminado la vista previa de la encuesta."
          }
        />

        {/* Botones de acciones */}
        <div className="flex gap-4 mt-6">
          <button
  onClick={() => navigate(`/resolver/${codigo}`)}
  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
>
  🌍 Resolver Encuesta
</button>


          <button
            onClick={() => setMostrarQR(!mostrarQR)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            📱 Generar QR
          </button>
        </div>

        {/* Mostrar QR */}
        {mostrarQR && (
          <div className="mt-6 p-4 border rounded bg-white shadow">
            <p className="mb-2 font-medium">
              Escanea este QR para abrir la encuesta:
            </p>
            <QRCodeCanvas
              value={`${window.location.origin}/resolver/${codigo}`}
              size={180}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{encuesta.titulo}</h1>
      {encuesta.Secciones?.map((seccion, idx) => (
        <Seccion
          key={seccion.id_seccion}
          seccion={seccion}
          modo="preview"
          onFinalizar={
            idx === encuesta.Secciones.length - 1
              ? () => setFinalizado(true)
              : null
          }
        />
      ))}
    </div>
  );
}
