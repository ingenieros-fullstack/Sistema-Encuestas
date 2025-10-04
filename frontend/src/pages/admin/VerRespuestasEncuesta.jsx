import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function VerRespuestasEncuesta() {
  const { codigo } = useParams();
  const token = localStorage.getItem("token");

  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);

  // Cargar resumen general de empleados asignados
  useEffect(() => {
    fetch(`${API_URL}/admin/encuestas/${codigo}/respuestas`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setEmpleados(data.empleados || []);
        setLoading(false);
      })
      .catch((err) => console.error("Error cargando empleados:", err));
  }, [codigo, token]);

  const verDetalle = (id_usuario) => {
    fetch(`${API_URL}/admin/encuestas/${codigo}/respuestas?usuario=${id_usuario}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((info) => setDetalle(info))
      .catch((err) => console.error("Error cargando detalle:", err));
  };

  return (
    <div>
      <Navbar rol="admin" nombre="Administrador" />

      <div className="container py-4">
        <h2 className="text-primary mb-3">📋 Respuestas de la encuesta</h2>

        {loading ? (
          <p>Cargando empleados...</p>
        ) : empleados.length === 0 ? (
          <p>No hay empleados asignados a esta encuesta.</p>
        ) : (
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Empleado</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Fecha respuesta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((e, i) => (
                <tr key={e.id_usuario}>
                  <td>{i + 1}</td>
                  <td>{e.nombre}</td>
                  <td>{e.correo}</td>
                  <td>
                    {e.estado === "completado" ? (
                      <span className="badge bg-success">Completado</span>
                    ) : (
                      <span className="badge bg-warning text-dark">{e.estado}</span>
                    )}
                  </td>
                  <td>
                    {e.fecha_respuesta
                      ? new Date(e.fecha_respuesta).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {e.estado === "completado" ? (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => verDetalle(e.id_usuario)}
                      >
                        Ver respuestas
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-secondary" disabled>
                        Pendiente
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal detalle respuestas */}
        {detalle && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content p-3">
                <h5>
                  Respuestas de {detalle.empleado.nombre} (
                  {detalle.empleado.correo})
                </h5>
                <table className="table table-bordered mt-3">
                  <thead>
                    <tr>
                      <th>Pregunta</th>
                      <th>Respuesta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.respuestas.map((r) => (
                      <tr key={r.id_pregunta}>
                        <td>{r.pregunta}</td>
                        <td>{r.respuesta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-end">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setDetalle(null)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
