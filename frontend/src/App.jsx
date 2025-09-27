import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";  
import Login from "./pages/Login";  
import ChangePassword from "./components/modals/ChangePasswordModal";  
import AdminDashboard from "./pages/AdminDashboard";  
import EmpleadoDashboard from "./pages/EmpleadoDashboard";  
import SupervisorDashboard from "./pages/SupervisorDashboard";  
import Usuarios from "./pages/admin/Usuarios";  
import CrearFormulario from "./pages/admin/CrearFormulario";  
import Formularios from "./pages/admin/Formularios";  
import Reportes from "./pages/admin/Reportes";  
  
// Componente PrivateRoute existente  
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
  
// CORREGIDO: Componente para proteger la ruta de cambio de contraseña  
function ProtectedChangePassword() {  
  const mustChangePassword = localStorage.getItem("mustChangePassword");  
  const rol = localStorage.getItem("rol");  
  const token = localStorage.getItem("token");  
    
  // Verificar autenticación primero  
  if (!token) {  
    return <Navigate to="/" replace />;  
  }  
    
  // Solo permitir acceso si realmente debe cambiar contraseña  
  if (mustChangePassword !== "true" || !["empleado", "supervisor"].includes(rol)) {  
    // Redirigir al dashboard correspondiente  
    let dashboardPath = "/";  
    if (rol === "admin") dashboardPath = "/admin/dashboard";  
    else if (rol === "empleado") dashboardPath = "/empleado/dashboard";  
    else if (rol === "supervisor") dashboardPath = "/supervisor/dashboard";  
      
    return <Navigate to={dashboardPath} replace />;  
  }  
    
  return <ChangePassword />;  
}  
  
function App() {  
  return (  
    <Router>  
      <Routes>  
        {/* Página de login */}  
        <Route path="/" element={<Login />} />  
          
        {/* Cambio de contraseña PROTEGIDO */}  
        <Route path="/change-password" element={<ProtectedChangePassword />} />  
  
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