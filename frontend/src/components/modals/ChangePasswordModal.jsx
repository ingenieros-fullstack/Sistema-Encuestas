import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/CambioContraseña.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ChangePasswordModal() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  // Evaluación de la contraseña nueva
  const pwStats = useMemo(() => {
    const lenOK = newPassword.length >= 8;
    const upper = /[A-Z]/.test(newPassword);
    const lower = /[a-z]/.test(newPassword);
    const num = /\d/.test(newPassword);
    const sym = /[^\w\s]/.test(newPassword);
    const varietyOK = upper && lower;
    const rules = { lenOK, varietyOK, num, sym };
    const score = Object.values(rules).filter(Boolean).length; // 0..4
    const labels = ["Muy débil", "Débil", "Aceptable", "Fuerte", "Excelente"];
    return { score, label: labels[score], rules };
  }, [newPassword]);

  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;

  const canSubmit =
    !loading &&
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    passwordsMatch;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (newPassword !== confirmPassword) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      setMensaje("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("mustChangePassword", "false");
        const rol = localStorage.getItem("rol");
        const nextPath =
          rol === "empleado"
            ? "/empleado/dashboard"
            : rol === "supervisor"
            ? "/supervisor/dashboard"
            : "/admin/dashboard";
        navigate(nextPath, { replace: true });
      } else {
        setMensaje(data?.message || "Error al cambiar contraseña");
      }
    } catch {
      setMensaje("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cpw-shell">
      <div className="cpw-card">
        <div className="cpw-header">
          <div className="cpw-badge" aria-hidden="true">🔐</div>
          <div>
            <h1 className="cpw-title">Actualiza tu contraseña</h1>
            <p className="cpw-subtitle">
              Por seguridad, establece una nueva contraseña antes de continuar.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="cpw-form">
          {/* Actual */}
          <Field
            label="Contraseña actual"
            type={showCur ? "text" : "password"}
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="••••••••"
            right={
              <ShowBtn onClick={() => setShowCur((v) => !v)} on={showCur} />
            }
          />

          {/* Nueva */}
          <Field
            label="Nueva contraseña"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Mínimo 8 caracteres"
            right={
              <ShowBtn onClick={() => setShowNew((v) => !v)} on={showNew} />
            }
          />

          {/* Fuerza */}
          <div className="cpw-strengthWrap">
            <div className="cpw-strength">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`cpw-bar ${i < pwStats.score ? "is-active" : ""}`}
                />
              ))}
            </div>
            <div className="cpw-strengthLabel">
              Fuerza: <b>{pwStats.label}</b>
            </div>
          </div>

          {/* Confirmación */}
          <Field
            label="Confirmar nueva contraseña"
            type={showConf ? "text" : "password"}
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repite tu nueva contraseña"
            right={
              <ShowBtn onClick={() => setShowConf((v) => !v)} on={showConf} />
            }
            status={
              confirmPassword.length === 0
                ? undefined
                : passwordsMatch
                ? "ok"
                : "error"
            }
          />

          {/* Reglas */}
          <div className="cpw-rules">
            <Rule ok={pwStats.rules.lenOK}>Al menos 8 caracteres</Rule>
            <Rule ok={pwStats.rules.varietyOK}>Mayúsculas y minúsculas</Rule>
            <Rule ok={pwStats.rules.num}>Al menos un número</Rule>
            <Rule ok={pwStats.rules.sym}>Al menos un símbolo</Rule>
          </div>

          {mensaje && <div className="cpw-alert">{mensaje}</div>}

          <button className="cpw-btn" type="submit" disabled={!canSubmit}>
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>

        <p className="cpw-footer">
          Consejo: evita reutilizar contraseñas de otros sitios.
        </p>
      </div>
    </div>
  );
}

/* -------- Subcomponentes -------- */

function Field({ label, type, value, onChange, placeholder, right, status }) {
  return (
    <label className="cpw-field">
      <span className="cpw-label">{label}</span>
      <div
        className={[
          "cpw-inputWrap",
          status === "ok" ? "ok" : "",
          status === "error" ? "error" : "",
        ].join(" ")}
      >
        <input
          className="cpw-input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
        />
        {right}
      </div>
    </label>
  );
}

function ShowBtn({ on, onClick }) {
  return (
    <button
      type="button"
      className="cpw-showbtn"
      onClick={onClick}
      aria-label={on ? "Ocultar contraseña" : "Mostrar contraseña"}
      title={on ? "Ocultar" : "Mostrar"}
    >
      {on ? "Ocultar" : "Mostrar"}
    </button>
  );
}

function Rule({ ok, children }) {
  return (
    <div className={`cpw-rule ${ok ? "ok" : ""}`}>
      <span aria-hidden="true">{ok ? "✔️" : "•"}</span>
      <span>{children}</span>
    </div>
  );
}
