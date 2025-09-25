import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmpleadoDashboard from "./pages/EmpleadoDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import Usuarios from "./pages/admin/Usuarios";
import CrearFormulario from "./pages/admin/CrearFormulario";
import Formularios from "./pages/admin/Formularios";
import Reportes from "./pages/admin/Reportes";

// =======================
// Componente PrivateRoute
// =======================
function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Página de login */}
        <Route path="/" element={<Login />} />

        {/* Dashboards protegidos */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/empleado/dashboard"
          element={
            <PrivateRoute roles={["empleado"]}>
              <EmpleadoDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/supervisor/dashboard"
          element={
            <PrivateRoute roles={["supervisor"]}>
              <SupervisorDashboard />
            </PrivateRoute>
          }
        />

        {/* Módulos Admin */}
        <Route
          path="/admin/usuarios"
          element={
            <PrivateRoute roles={["admin"]}>
              <Usuarios />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/formulario/crear"
          element={
            <PrivateRoute roles={["admin"]}>
              <CrearFormulario />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/formularios"
          element={
            <PrivateRoute roles={["admin"]}>
              <Formularios />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reportes"
          element={
            <PrivateRoute roles={["admin"]}>
              <Reportes />
            </PrivateRoute>
          }
        />

        {/* Redirección default */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
