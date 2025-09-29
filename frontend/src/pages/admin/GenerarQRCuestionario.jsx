import { QRCodeCanvas } from "qrcode.react";
import { useParams } from "react-router-dom";

export default function GenerarQRCuestionario() {
  const { codigo } = useParams();
  const url = `${window.location.origin}/resolver/cuestionario/${codigo}`;

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Código QR del Cuestionario</h1>
      <p className="mb-4 text-gray-600">
        Escanee este código para acceder al cuestionario (empleados y supervisores):
      </p>

      <div className="bg-white p-4 rounded shadow">
        <QRCodeCanvas value={url} size={250} />
      </div>

      <p className="mt-4 text-sm text-gray-500">{url}</p>
    </div>
  );
}
