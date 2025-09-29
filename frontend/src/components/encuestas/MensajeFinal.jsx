export default function MensajeFinal({ mensajeFinal }) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">¡Gracias por participar!</h2>
      <p className="text-gray-700">
        {mensajeFinal || "Tus respuestas han sido registradas con éxito."}
      </p>
    </div>
  );
}
