import { QRCodeCanvas } from "qrcode.react";
import { useParams } from "react-router-dom";

export default function GenerarQR() {
  const { codigo } = useParams();
  const url = `${window.location.origin}/resolver/${codigo}`;

  const esEncuesta = codigo.startsWith("ENC-");

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">
        {esEncuesta ? "Código QR de la Encuesta" : "Código QR del Cuestionario"}
      </h1>
      <p className="mb-4 text-gray-600">
        {esEncuesta
          ? "Escanee este código para acceder a la encuesta (empleados y supervisores):"
          : "Escanee este código para acceder al cuestionario (empleados):"}
      </p>

      <div className="bg-white p-4 rounded shadow">
        <QRCodeCanvas value={url} size={250} />
      </div>

      <p className="mt-4 text-sm text-gray-500">{url}</p>
    </div>
  );
}
