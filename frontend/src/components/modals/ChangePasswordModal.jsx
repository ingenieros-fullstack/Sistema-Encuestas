import { useState } from "react";  
import { useNavigate } from "react-router-dom";  
import "/src/App.css";  
  
export default function ChangePassword() {  
  const [currentPassword, setCurrentPassword] = useState("");  
  const [newPassword, setNewPassword] = useState("");  
  const [confirmPassword, setConfirmPassword] = useState("");  
  const [mensaje, setMensaje] = useState("");  
  const [loading, setLoading] = useState(false);  
  const navigate = useNavigate();  
  
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
      const res = await fetch("http://localhost:4000/auth/change-password", {  
        method: "POST",  
        headers: {  
          "Content-Type": "application/json",  
          "Authorization": `Bearer ${token}`  
        },  
        body: JSON.stringify({ currentPassword, newPassword }),  
      });  
  
      const data = await res.json();  
  
      if (res.ok) {  
        localStorage.setItem("mustChangePassword", "false");  
        const rol = localStorage.getItem("rol");  
        const nextPath = rol === "empleado" ? "/empleado/dashboard" : "/supervisor/dashboard";  
        navigate(nextPath, { replace: true });  
      } else {  
        setMensaje(data.message || "Error al cambiar contraseña");  
      }  
    } catch (error) {  
      setMensaje("Error de conexión con el servidor");  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  return (  
    <div className="login-background">  
      <div className="login-card">  
        <h2 className="login-title">🔒 Cambio de Contraseña Obligatorio</h2>  
        <p style={{ color: "#f0f0f0", marginBottom: "1.5rem", textAlign: "center" }}>  
          Por seguridad, debes cambiar tu contraseña antes de continuar.  
        </p>  
          
        <form onSubmit={handleChangePassword}>  
          <input  
            type="password"  
            className="form-control"  
            placeholder="Contraseña actual"  
            value={currentPassword}  
            onChange={(e) => setCurrentPassword(e.target.value)}  
            required  
          />  
          <input  
            type="password"  
            className="form-control"  
            placeholder="Nueva contraseña (mín. 6 caracteres)"  
            value={newPassword}  
            onChange={(e) => setNewPassword(e.target.value)}  
            required  
          />  
          <input  
            type="password"  
            className="form-control"  
            placeholder="Confirmar nueva contraseña"  
            value={confirmPassword}  
            onChange={(e) => setConfirmPassword(e.target.value)}  
            required  
          />  
            
          <button type="submit" className="btn btn-login mt-3" disabled={loading}>  
            {loading ? "Cambiando..." : "Cambiar Contraseña"}  
          </button>  
            
          {mensaje && (  
            <div className="alert alert-danger" style={{ marginTop: "1rem" }}>  
              {mensaje}  
            </div>  
          )}  
        </form>  
      </div>  
    </div>  
  );  
}