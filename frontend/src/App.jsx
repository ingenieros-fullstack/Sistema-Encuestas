import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// =================== Páginas Base ===================
import Login from "./pages/Login";
import ChangePassword from "./components/modals/ChangePasswordModal";
import AdminDashboard from "./pages/AdminDashboard";
import EmpleadoDashboard from "./pages/EmpleadoDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";

// =================== Admin ===================
import Usuarios from "./pages/admin/Usuarios";
import CrearFormulario from "./pages/admin/CrearFormulario";
import Formularios from "./pages/admin/Formularios";
import Reportes from "./pages/admin/Reportes";
import EditarFormulario from "./pages/admin/EditarFormulario";

// =================== Encuestas ===================
import PreviewEncuesta from "./pages/admin/PreviewEncuesta";
import ResolverEncuestaEmpleado from "./pages/empleado/ResolverEncuesta";
import ResolverEncuestaSupervisor from "./pages/supervisor/ResolverEncuesta";
import RedirectResolver from "./pages/RedirectResolver";
import GenerarQR from "./pages/admin/GenerarQR";
import VerRespuestasEncuesta from "./pages/admin/VerRespuestasEncuesta";
import VerRespuestasCuestionario from "./pages/admin/VerRespuestasCuestionario";
// 🆕 Nueva ruta modularizada
import GestionSecciones from "./pages/admin/GestionSeccionesEncuesta/GestionSecciones";

// =================== Cuestionarios ===================
import PreviewCuestionario from "./pages/admin/PreviewCuestionario";
import ResolverCuestionarioEmpleado from "./pages/empleado/ResolverCuestionario";
import ResolverCuestionarioSupervisor from "./pages/supervisor/ResolverCuestionario";
import GestionSeccionesCuestionario from "./pages/admin/GestionSeccionesCuestionario";
import GenerarQRCuestionario from "./pages/admin/GenerarQRCuestionario";

// =================== Helpers ===================
function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  if (!token) return <Navigate to="/" replace />;
  if (roles && !roles.includes(rol)) return <Navigate to="/" replace />;

  return children;
}

function ProtectedChangePassword() {
  const mustChangePassword = localStorage.getItem("mustChangePassword");
  const rol = localStorage.getItem("rol");
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" replace />;

  if (mustChangePassword !== "true" || !["empleado", "supervisor"].includes(rol)) {
    let dashboardPath = "/";
    if (rol === "admin") dashboardPath = "/admin/dashboard";
    else if (rol === "empleado") dashboardPath = "/empleado/dashboard";
    else if (rol === "supervisor") dashboardPath = "/supervisor/dashboard";
    return <Navigate to={dashboardPath} replace />;
  }

  return <ChangePassword />;
}

// =================== App ===================
function App() {
  return (
    <Router>
      <Routes>
        {/* ========== LOGIN & PASSWORD ========== */}
        <Route path="/" element={<Login />} />
        <Route path="/change-password" element={<ProtectedChangePassword />} />

        {/* ========== DASHBOARDS ========== */}
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

        {/* ========== ADMIN (Usuarios, Formularios, Reportes) ========== */}
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
          path="/admin/formularios/editar/:codigo"
          element={
            <PrivateRoute roles={["admin"]}>
              <EditarFormulario />
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

        {/* ========== ENCUESTAS ========== */}
        <Route
          path="/admin/encuestas/:codigo/preview"
          element={
            <PrivateRoute roles={["admin"]}>
              <PreviewEncuesta />
            </PrivateRoute>
          }
        />
        <Route path="/empleado/encuestas/:codigo" element={<ResolverEncuestaEmpleado />} />
        <Route
          path="/supervisor/encuestas/:codigo"
          element={
            <PrivateRoute roles={["supervisor"]}>
              <ResolverEncuestaSupervisor />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/encuestas/:codigo/secciones"
          element={
            <PrivateRoute roles={["admin"]}>
              <GestionSecciones />
            </PrivateRoute>
          }
        />
        <Route
          path="/resolver/:codigo"
          element={
            <PrivateRoute roles={["empleado", "supervisor", "admin"]}>
              <RedirectResolver />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/encuestas/:codigo/qr"
          element={
            <PrivateRoute roles={["admin"]}>
              <GenerarQR />
            </PrivateRoute>
          }
        />

        <Route
  path="/admin/encuestas/:codigo/respuestas"
  element={<VerRespuestasEncuesta />}
/>
<Route
  path="/admin/cuestionarios/:codigo/respuestas"
  element={<VerRespuestasCuestionario />}
/>

        {/* ========== CUESTIONARIOS ========== */}
        <Route
          path="/admin/cuestionarios/:codigo/preview"
          element={
            <PrivateRoute roles={["admin"]}>
              <PreviewCuestionario />
            </PrivateRoute>
          }
        />
        <Route
          path="/empleado/cuestionarios/:codigo"
          element={
            <PrivateRoute roles={["empleado"]}>
              <ResolverCuestionarioEmpleado />
            </PrivateRoute>
          }
        />
        <Route
          path="/supervisor/cuestionarios/:codigo"
          element={
            <PrivateRoute roles={["supervisor"]}>
              <ResolverCuestionarioSupervisor />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/cuestionarios/:codigo/secciones"
          element={
            <PrivateRoute roles={["admin"]}>
              <GestionSeccionesCuestionario />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/cuestionarios/:codigo/qr"
          element={
            <PrivateRoute roles={["admin"]}>
              <GenerarQRCuestionario />
            </PrivateRoute>
          }
        />

        {/* ========== DEFAULT ========== */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
