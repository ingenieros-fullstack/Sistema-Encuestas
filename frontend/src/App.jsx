import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";

// Dashboards mínimos de prueba
function AdminDashboard() {
  return <h1>Bienvenido al Dashboard Admin 🚀</h1>;
}
function UsuarioDashboard() {
  return <h1>Bienvenido al Dashboard Usuario 👤</h1>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página inicial = login */}
        <Route path="/" element={<Login />} />

        {/* Dashboards */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/usuario/dashboard" element={<UsuarioDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
