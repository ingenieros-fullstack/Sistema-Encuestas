import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Seccion from "../../components/cuestionario/Seccion";

import Introduccion from "../../components/cuestionario/Introduccion";
import MensajeFinal from "../../components/cuestionario/MensajeFinal";
import { QRCodeCanvas } from "qrcode.react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PreviewCuestionario() {
  const { codigo } = useParams();
  const [cuestionario, setCuestionario] = useState(null);
  const [mostrarIntro, setMostrarIntro] = useState(true);
  const [finalizado, setFinalizado] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/admin/cuestionarios/${codigo}/preview`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar preview");
        return res.json();
      })
      .then((data) => setCuestionario(data))
      .catch((err) => console.error("❌ Error cargando preview:", err));
  }, [codigo]);

  if (!cuestionario) return <p>Cargando cuestionario...</p>;

  // ===== Intro =====
  if (mostrarIntro) {
    return (
      <Introduccion
        titulo={cuestionario.titulo}
        texto={cuestionario.introduccion}
        tiempoLimite={cuestionario.tiempo_limite}
        onComenzar={() => setMostrarIntro(false)}
      />
    );
  }

  // ===== Mensaje Final =====
  if (finalizado) {
    const puntajeTotal = cuestionario.Secciones?.flatMap((s) => s.Preguntas || [])
      .reduce((acc, p) => acc + (p.puntaje || 0), 0);

    return (
      <div className="p-6 space-y-6">
        <MensajeFinal
          texto={
            cuestionario.texto_final ||
            "Has terminado la vista previa del cuestionario."
          }
          aprobado={puntajeTotal >= (cuestionario.umbral_aprobacion || 0)}
          puntajeTotal={puntajeTotal}
          umbral={cuestionario.umbral_aprobacion}
        />

        {/* Botones de acción */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => navigate(`/resolver/${codigo}`)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            🚀 Resolver Cuestionario
          </button>

          <button
            onClick={() => setMostrarQR(!mostrarQR)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            📱 Generar QR
          </button>
        </div>

        {/* QR */}
        {mostrarQR && (
          <div className="mt-6 p-4 border rounded bg-white shadow">
            <p className="mb-2 font-medium">
              Escanea este QR para abrir el cuestionario:
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

  // ===== Secciones =====
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{cuestionario.titulo}</h1>
      {cuestionario.Secciones?.map((seccion, idx) => (
        <Seccion
          key={seccion.id_seccion}
          seccion={seccion}
          modo="preview"
          onFinalizar={
            idx === cuestionario.Secciones.length - 1
              ? () => setFinalizado(true)
              : null
          }
        />
      ))}
    </div>
  );
}
