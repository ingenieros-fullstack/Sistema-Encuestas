// src/components/modals/AsignarFormulariosModal.jsx
export default function AsignarFormulariosModal({ onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-centered">
        <div className="modal-header bg-warning text-dark d-flex justify-content-between align-items-center">
          <h5 className="modal-title m-0">📝 Asignar Formularios</h5>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Selecciona el usuario al que deseas asignar un formulario:</p>
          <select className="form-select">
            <option>Empleado 1</option>
            <option>Empleado 2</option>
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary">Asignar</button>
        </div>
      </div>
    </div>
  );
}
