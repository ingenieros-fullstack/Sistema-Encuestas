import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChangePasswordModal from "../components/modals/ChangePasswordModal";

export default function SupervisorDashboard() {
  const nombre = localStorage.getItem("nombre") || "Supervisor";
  const rol = localStorage.getItem("rol") || "supervisor";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [correo, setCorreo] = useState("");
  const [asignaciones, setAsignaciones] = useState([]);
  const [filtro, setFiltro] = useState("pendientes");
  const [selectedForm, setSelectedForm] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Verificar si debe cambiar contraseña
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.mustChangePassword) {
          setMustChangePassword(true);
          setCorreo(data.correo);
        }
      })
      .catch(() => {});
  }, [token]);

  // Cargar asignaciones
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/supervisor/asignaciones`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAsignaciones(data || []);
      })
      .catch(() => {});
  }, [token]);

  // Filtrar asignaciones
  const asignacionesFiltradas =
    filtro === "pendientes"
      ? asignaciones.filter((a) => a.estado !== "completado")
      : asignaciones.filter((a) => a.estado === "completado");

  // Redirigir al resolver
  const handleOpenForm = (codigo) => {
    navigate(`/resolver-cuestionario/${codigo}`);
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Navbar rol={rol} nombre={nombre} />

      <main style={{ padding: "2rem" }}>
        <h1>
          Bienvenido{" "}
          <span style={{ color: "#f97316" }}>{nombre}</span>, este es tu
          Dashboard de <span className="text-uppercase">{rol}</span>
        </h1>

        {/* Navbar de filtros */}
        <div className="btn-group mt-4" role="group">
          <button
            className={`btn ${
              filtro === "pendientes" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setFiltro("pendientes")}
          >
            📋 Pendientes
          </button>
          <button
            className={`btn ${
              filtro === "completados" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setFiltro("completados")}
          >
            ✅ Completados
          </button>
        </div>

        {/* Lista de asignaciones */}
        {asignacionesFiltradas.length === 0 ? (
          <p className="mt-3">
            {filtro === "pendientes"
              ? "No hay formularios pendientes asignados."
              : "No hay formularios completados."}
          </p>
        ) : (
          <ul className="list-group mt-3">
            {asignacionesFiltradas.map((a) => (
              <li
                key={a.id_asignacion}
                className="list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row"
              >
                <div>
                  <h5>{a.Formulario?.titulo}</h5>
                  <p className="mb-1">
                    <strong>Empleado:</strong>{" "}
                    {a.Usuario?.empleado?.nombre || "Desconocido"}
                  </p>
                  <p className="mb-1">
                    <strong>Estado asignación:</strong> {a.estado}
                  </p>
                  <p className="mb-1">
                    <strong>Estado formulario:</strong>{" "}
                    {a.Formulario?.estatus}
                  </p>
                  <p className="mb-1">
                    <strong>Tiempo límite:</strong>{" "}
                    {a.Formulario?.tiempo_limite
                      ? `${a.Formulario.tiempo_limite} min`
                      : "Sin límite"}
                  </p>
                  <p className="mb-1">
                    <strong>Fecha inicio:</strong>{" "}
                    {a.Formulario?.fecha_inicio
                      ? new Date(a.Formulario.fecha_inicio).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="mb-1">
                    <strong>Fecha fin:</strong>{" "}
                    {a.Formulario?.fecha_fin
                      ? new Date(a.Formulario.fecha_fin).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                {a.estado !== "completado" && (
                  <div className="mt-2 mt-md-0">
                    <button
                      className="btn btn-success"
                      onClick={() => setSelectedForm(a)}
                    >
                      Resolver
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Modal de confirmación */}
      {selectedForm && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <h5 className="modal-title">⚠️ Confirmación</h5>
              <p>
                Estás a punto de resolver el cuestionario{" "}
                <strong>{selectedForm.Formulario?.titulo}</strong>. <br />
                ¿Deseas abrirlo ahora?
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedForm(null)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleOpenForm(selectedForm.codigo_formulario)}
                >
                  Abrir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de contraseña */}
      {mustChangePassword && (
        <ChangePasswordModal
          onClose={() => setMustChangePassword(false)}
          correo={correo}
        />
      )}
    </div>
  );
}
