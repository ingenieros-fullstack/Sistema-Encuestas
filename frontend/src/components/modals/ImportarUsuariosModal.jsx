// src/components/modals/ImportarUsuariosModal.jsx
import { useState } from "react";

export default function ImportarUsuariosModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (
        validTypes.includes(selectedFile.type) ||
        selectedFile.name.endsWith(".csv") ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls")
      ) {
        setFile(selectedFile);
        setError("");
      } else {
        setError("Por favor selecciona un archivo CSV o Excel válido");
        setFile(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:4000/admin/usuarios/import",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult(data);
        if (onSuccess) onSuccess(data);
      } else {
        setError(data.message || "Error al importar usuarios");
        if (data.errors) {
          setError(data.errors.join("\n"));
        }
      }
    } catch (error) {
      setError("Error de conexión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      setTimeout(() => onClose(), 0); // 👈 evita desmontaje en medio de render
    }
  };

  const downloadTemplate = () => {
    const a = document.createElement("a");
    a.href = "http://localhost:4000/uploads/plantilla_usuarios.csv";
    a.download = "plantilla_usuarios.csv";
    a.click();
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="custom-modal"
        style={{
          background: "rgba(0, 8, 20, 0.7)",
          borderRadius: "16px",
          width: "90%",
          maxWidth: "600px",
          color: "#ffffff",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          borderBottom: "4px solid #FFC300",
          overflow: "hidden",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()} // 👈 evita cierre por clic interno
      >
        {/* Header */}
        <div
          style={{
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            background: "transparent",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-upload text-warning"></i>
            Importar Usuarios
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#ffc300",
              fontSize: "1.5rem",
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem", fontSize: "0.95rem" }}>
          {!result ? (
            <div key="form">
              <p className="mb-3">
                Sube un archivo <strong>.Excel</strong> o{" "}
                <strong>.CSV</strong> para importar usuarios:
              </p>
              <div className="mb-3">
                <button
                  onClick={downloadTemplate}
                  className="btn btn-outline-warning btn-sm"
                  style={{ color: "#ffc300", borderColor: "#ffc300" }}
                >
                  <i className="bi bi-download me-1"></i> Descargar plantilla CSV
                </button>
              </div>
              <input
                type="file"
                className="form-control"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
              {file && (
                <div
                  className="alert alert-success mt-2"
                  style={{ fontSize: "0.9rem" }}
                >
                  <i className="bi bi-check-circle me-1"></i> Archivo
                  seleccionado: {file.name}
                </div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert">
                  <pre
                    className="mb-0"
                    style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem" }}
                  >
                    {error}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div key="success" className="alert alert-success" role="alert">
              <h6 className="alert-heading mb-2">
                <i className="bi bi-check-circle me-1"></i> Importación exitosa
              </h6>
              <p className="mb-3">{result.message}</p>

              {/* Usuarios creados */}
              {result.users && result.users.length > 0 && (
                <div className="mt-3">
                  <p className="fw-bold mb-2">
                    Usuarios creados con contraseña por defecto:
                  </p>
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {result.users.map((user) => (
                      <div
                        key={user.correo_electronico}
                        className="card mb-2"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <div
                          className="card-body p-2"
                          style={{ fontSize: "0.9rem" }}
                        >
                          <strong>{user.numero_empleado}</strong> - {user.nombre}{" "}
                          ({user.correo_electronico})
                          <br />
                          {/* 👇 contenedor estable con key única */}
                          <div key={`pass-${user.correo_electronico}`} className="mt-1">
                            <span className="text-danger">
                              Contraseña por defecto: Empleado2025
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registros omitidos */}
              {result.skippedCount > 0 && (
                <div className="alert alert-warning mt-3" role="alert">
                  <h6 className="alert-heading mb-2">
                    <i className="bi bi-exclamation-triangle me-1"></i>{" "}
                    Registros omitidos
                  </h6>
                  <p className="mb-2">
                    {result.skippedCount} registros fueron omitidos.{" "}
                    {result.skippedRanges &&
                      result.skippedRanges.length > 0 && (
                        <>Filas: {result.skippedRanges.join(", ")}.</>
                      )}
                  </p>
                  {result.skipped && result.skipped.length > 0 && (
                    <div
                      style={{
                        maxHeight: "150px",
                        overflowY: "auto",
                        fontSize: "0.85rem",
                      }}
                    >
                      {result.skipped.map((err, idx) => (
                        <div key={`${idx}-${err}`} className="mb-1">
                          <i className="bi bi-x-circle text-danger me-1"></i>{" "}
                          {err}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            padding: "1rem 1.5rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        >
          <button className="btn btn-outline-light" onClick={onClose}>
            {result ? "Cerrar" : "Cancelar"}
          </button>
          {!result && (
            <button
              className="btn btn-warning text-dark fw-bold"
              onClick={handleSubmit}
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Subiendo...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-arrow-up me-1"></i> Subir archivo
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
