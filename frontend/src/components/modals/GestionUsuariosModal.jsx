// src/components/modals/GestionUsuariosModal.jsx
export default function GestionUsuariosModal({ onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-centered">
        <div className="modal-header bg-success text-white d-flex justify-content-between align-items-center">
          <h5 className="modal-title m-0">👥 Gestión de Usuarios</h5>
          <button className="btn-close text-white" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Aquí podrás crear, editar o eliminar usuarios.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn btn-success">Nuevo Usuario</button>
        </div>
      </div>
    </div>
  );
}
