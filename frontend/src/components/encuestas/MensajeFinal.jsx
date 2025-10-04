export default function MensajeFinal({ mensajeFinal }) {
  return (
    <div className="text-center p-4">
      <h2 className="h4 fw-bold mb-2">¡Gracias por participar!</h2>
      <p className="text-muted mb-0">
        {mensajeFinal || "Has terminado la vista previa de la encuesta."}
      </p>
    </div>
  );
}
