import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChangePasswordModal from "../components/modals/ChangePasswordModal";

export default function EmpleadoDashboard() {
  const nombre = localStorage.getItem("nombre") || "Empleado";
  const rol = localStorage.getItem("rol") || "empleado";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [correo, setCorreo] = useState("");
  const [formularios, setFormularios] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [filtro, setFiltro] = useState("pendientes"); // "pendientes" | "completados"

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

  // Cargar formularios asignados
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/empleado/asignaciones`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFormularios(data || []);
      })
      .catch(() => {});
  }, [token]);

  const handleOpenForm = (codigo) => {
  navigate(`/empleado/encuestas/${codigo}`);
};


  // Filtrar formularios
  const formulariosFiltrados =
    filtro === "pendientes"
      ? formularios.filter((f) => f.estado !== "completado")
      : formularios.filter((f) => f.estado === "completado");

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Navbar rol={rol} nombre={nombre} />

      <main style={{ padding: "2rem" }}>
        <h1>
          Bienvenido{" "}
          <span style={{ color: "#16a34a" }}>{nombre}</span>, este es tu
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

        {/* Lista de formularios */}
        {formulariosFiltrados.length === 0 ? (
          <p className="mt-3">
            {filtro === "pendientes"
              ? "No tienes formularios pendientes."
              : "No tienes formularios completados."}
          </p>
        ) : (
          <ul className="list-group mt-3">
            {formulariosFiltrados.map((f) => (
              <li
                key={f.codigo_formulario}
                className="list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row"
              >
                <div>
                  <h5>{f.Formulario?.titulo}</h5>
                  <p className="mb-1">
                    <strong>Estado asignación:</strong> {f.estado}
                  </p>
                  <p className="mb-1">
                    <strong>Estado formulario:</strong>{" "}
                    {f.Formulario?.estatus}
                  </p>
                  <p className="mb-1">
                    <strong>Tiempo límite:</strong>{" "}
                    {f.Formulario?.tiempo_limite
                      ? `${f.Formulario.tiempo_limite} min`
                      : "Sin límite"}
                  </p>
                  <p className="mb-1">
                    <strong>Fecha inicio:</strong>{" "}
                    {f.Formulario?.fecha_inicio
                      ? new Date(f.Formulario.fecha_inicio).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="mb-1">
                    <strong>Fecha fin:</strong>{" "}
                    {f.Formulario?.fecha_fin
                      ? new Date(f.Formulario.fecha_fin).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                {f.estado !== "completado" && (
                  <div className="mt-2 mt-md-0">
                    <button
                      className="btn btn-success"
                      onClick={() => setSelectedForm(f)}
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
