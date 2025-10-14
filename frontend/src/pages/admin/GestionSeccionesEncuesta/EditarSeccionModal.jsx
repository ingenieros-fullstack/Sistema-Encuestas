import React from "react";

export default function EditarSeccionModal({
  modalEditarSeccion,
  setModalEditarSeccion,
  guardarEdicionSeccion,
}) {
  if (!modalEditarSeccion) return null;

  return (
    <div className="gs2-modal">
      <div className="gs2-modal-content">
        <h3>Editar Sección</h3>
        <input
          className="gs2-input"
          placeholder="Nuevo nombre de la sección"
          value={modalEditarSeccion.nombre_seccion}
          onChange={(e) =>
            setModalEditarSeccion({
              ...modalEditarSeccion,
              nombre_seccion: e.target.value,
            })
          }
        />
        <div className="gs2-modal-actions">
          <button className="gs2-btn" onClick={() => setModalEditarSeccion(null)}>
            Cancelar
          </button>
          <button
            className="gs2-btn gs2-btn-success"
            onClick={guardarEdicionSeccion}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
