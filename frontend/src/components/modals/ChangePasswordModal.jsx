// src/components/modals/ChangePasswordModal.jsx
import { useState } from "react";

export default function ChangePasswordModal({ onClose, correo }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ correo, nuevaPassword: password }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess("Contraseña actualizada con éxito. Vuelva a iniciar sesión.");
        setTimeout(() => {
          onClose();
          localStorage.removeItem("token");
          window.location.href = "/login"; // forzar re-login
        }, 2000);
      } else {
        setError(data.message || "Error al cambiar contraseña");
      }
    } catch (err) {
      setError("Error de conexión: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        className="modal-content p-4"
        style={{
          background: "#fff",
          borderRadius: "12px",
          width: "400px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h5 className="mb-3 text-center">Cambio de Contraseña</h5>
        <p className="text-muted" style={{ fontSize: "0.9rem" }}>
          Debe actualizar su contraseña para continuar.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="mb-3">
          <label className="form-label">Nueva contraseña</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Confirmar contraseña</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Actualizar"}
          </button>
        </div>
      </div>
    </div>
  );
}
