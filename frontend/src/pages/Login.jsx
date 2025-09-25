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

      // Redirigir según rol o nextPath enviado por el backend
      let target = "/";
      if (data.nextPath) {
        target = data.nextPath;
      } else {
        switch (data.rol) {
          case "admin":
            target = "/admin/dashboard";
            break;
          case "empleado":
            target = "/empleado/dashboard";
            break;
          case "supervisor":
            target = "/supervisor/dashboard";
            break;
          default:
            target = "/";
        }
      }

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Inicio de sesión
        </h2>

        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded font-semibold transition hover:bg-blue-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        {mensaje && (
          <p className="text-sm text-center text-red-500 mt-2">{mensaje}</p>
        )}
      </form>
    </div>
  );

}
