import { useState, useEffect } from "react";
import "../../css/VerEmpleados.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const EMPLEADOS_POR_PAGINA = 10;

export default function VerEmpleadosModal({ onClose }) {
  const [empleados, setEmpleados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [errorConexion, setErrorConexion] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/empleados`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al cargar empleados");
        const data = await res.json();

        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data.empleados)
          ? data.empleados
          : [];

        setEmpleados(lista);
        setErrorConexion(false);
      } catch (err) {
        console.error("❌ Error cargando empleados:", err);
        setEmpleados([]);
        setErrorConexion(true);
      }
    };

    fetchEmpleados();
  }, [token]);

  // === Filtrar empleados por texto ===
  const empleadosFiltrados = empleados.filter((e) => {
    const texto = busqueda.toLowerCase();
    return (
      e.nombre?.toLowerCase().includes(texto) ||
      e.numero_empleado?.toLowerCase().includes(texto) ||
      e.correo_electronico?.toLowerCase().includes(texto) ||
      e.centro_trabajo?.toLowerCase().includes(texto) ||
      e.departamento?.toLowerCase().includes(texto)
    );
  });

  // === Calcular paginación ===
  const totalPaginas = Math.ceil(empleadosFiltrados.length / EMPLEADOS_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * EMPLEADOS_POR_PAGINA;
  const empleadosPaginados = empleadosFiltrados.slice(
    indiceInicio,
    indiceInicio + EMPLEADOS_POR_PAGINA
  );

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target.classList.contains("modal-backdrop") && onClose()}
    >
      <div className="modal-container large">
        <div className="modal-header">
          <h5 className="modal-title">
            <i className="bi bi-person-badge-fill"></i> Lista de Empleados
          </h5>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="p-3">
          {/* === Mensaje de error de conexión === */}
          {errorConexion && (
            <div className="alert alert-danger text-center" role="alert">
              No se pudo conectar con el servidor ({API_URL}). Verifica que el backend esté corriendo.
            </div>
          )}

          <input
            type="text"
            placeholder="Buscar por nombre, correo, código o centro"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="form-control mb-3"
          />

          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle">
              <thead className="table-primary">
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Centro de trabajo</th>
                  <th>Departamento</th>
                  <th>Supervisor</th>
                </tr>
              </thead>
              <tbody>
                {empleadosPaginados.length > 0 ? (
                  empleadosPaginados.map((e) => (
                    <tr key={e.id_data}>
                      <td>{e.id_data}</td>
                      <td>{e.numero_empleado || "-"}</td>
                      <td>{e.nombre || "-"}</td>
                      <td>{e.correo_electronico || "-"}</td>
                      <td>{e.centro_trabajo || "-"}</td>
                      <td>{e.departamento || "-"}</td>
                      <td>{e.supervisor || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No hay empleados registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* === Controles de paginación === */}
          {empleadosFiltrados.length > EMPLEADOS_POR_PAGINA && (
            <div className="pagination-controls d-flex justify-content-between align-items-center mt-3">
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="btn btn-secondary"
              >
                ← Anterior
              </button>
              <span>
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="btn btn-secondary"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
