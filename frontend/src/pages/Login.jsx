import { useState } from "react";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Guardar token en localStorage
        localStorage.setItem("token", data.token);
        setMensaje(`Bienvenido ${data.nombre} (${data.rol})`);
      } else {
        setMensaje(data.message || "Error en login");
      }
    } catch (error) {
      setMensaje("Error de conexión con el backend");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "5rem" }}>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "300px" }}>
        <h2>Login</h2>
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
        <button type="submit">Ingresar</button>
        {mensaje && <p>{mensaje}</p>}
      </form>
    </div>
  );
}
