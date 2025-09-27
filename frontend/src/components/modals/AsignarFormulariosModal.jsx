// src/components/modals/AsignarFormulariosModal.jsx
import "../../AsignarFormularios.css";

export default function AsignarFormulariosModal({ onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="asignar-modal-container">
        {/* Header */}
        <div className="asignar-modal-header">
          <h5 className="asignar-title">
            📝 Asignar Formularios
          </h5>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="asignar-modal-body">
          <p className="asignar-text">
            Selecciona el usuario al que deseas asignar un formulario:
          </p>
          <select className="asignar-select">
            <option>Empleado 1</option>
            <option>Empleado 2</option>
          </select>
        </div>

        {/* Footer */}
        <div className="asignar-modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary">
            Asignar
          </button>
        </div>
      </div>
    </div>
  );
}
