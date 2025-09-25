import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Login error:", res.status, data);
        setMensaje(data.message || "Error en login");
        return;
      }

      // Guardar datos en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.rol || "");
      localStorage.setItem("nombre", data.nombre || "");

      // Redirigir según backend
      const target =
        data.nextPath ||
        (data.rol === "admin" ? "/admin/dashboard" : "/usuario/dashboard");

      setMensaje(`Bienvenido ${data.nombre} (${data.rol})`);
      navigate(target, { replace: true });
    } catch (err) {
      console.error("Fetch falló:", err);
      setMensaje("Error de conexión con el backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "5rem" }}>
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "300px" }}
      >
        <h2>Logon</h2>
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        {mensaje && <p>{mensaje}</p>}
      </form>
    </div>
  );
}
