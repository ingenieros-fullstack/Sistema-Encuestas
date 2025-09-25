// src/components/modals/ImportarUsuariosModal.jsx
export default function ImportarUsuariosModal({ onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-centered">
        <div className="modal-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="modal-title m-0">📥 Importar Usuarios</h5>
          <button className="btn-close text-white" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Sube un archivo Excel/CSV para importar usuarios:</p>
          <input type="file" className="form-control" accept=".csv,.xlsx" />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary">Subir archivo</button>
        </div>
      </div>
    </div>
  );
}
