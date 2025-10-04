import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function VerRespuestasCuestionario() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/admin/encuestas/${codigo}/respuestas`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((info) => {
        setData(info);
        setLoading(false);
      })
      .catch((err) => console.error("Error cargando respuestas:", err));
  }, [codigo, token]);

  if (loading) return <p className="p-4">Cargando respuestas...</p>;
  if (!data) return <p className="p-4">No se encontraron respuestas.</p>;

  return (
    <div>
      <Navbar rol="admin" nombre="Administrador" />

      <div className="container py-4">
        <button
          className="btn btn-outline-secondary mb-3"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        <h2 className="text-success mb-2">{data.formulario.titulo}</h2>
        <p>
          <strong>Empleado:</strong> {data.empleado.nombre} (
          {data.empleado.correo})
        </p>

        <div className="alert alert-info mt-3">
          <strong>Tipo:</strong> Cuestionario con puntaje individual.
        </div>

        <table className="table table-hover mt-4">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Pregunta</th>
              <th>Respuesta</th>
              <th>Puntaje</th>
            </tr>
          </thead>
          <tbody>
            {data.respuestas.map((r, i) => (
              <tr key={r.id_pregunta}>
                <td>{i + 1}</td>
                <td>{r.pregunta}</td>
                <td>{r.respuesta}</td>
                <td>{r.puntaje_obtenido ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-end mt-3">
          <strong>Total: </strong>
          {data.respuestas.reduce(
            (sum, r) => sum + (r.puntaje_obtenido || 0),
            0
          )}
        </div>
      </div>
    </div>
  );
}
