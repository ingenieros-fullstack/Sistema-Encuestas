import { useEffect, useState } from "react";  
import { useParams, useNavigate } from "react-router-dom";  
import Navbar from "../../components/Navbar";  
  
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";  
  
export default function VerRespuestasCuestionario() {  
  const { codigo } = useParams();  
  const navigate = useNavigate();  
  const token = localStorage.getItem("token");  
  
  const [empleados, setEmpleados] = useState([]);  
  const [loading, setLoading] = useState(true);  
  const [detalle, setDetalle] = useState(null);  
  
  // Cargar resumen general de empleados asignados  
  useEffect(() => {  
    fetch(`${API_URL}/admin/cuestionarios/${codigo}/respuestas`, {  
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
    fetch(`${API_URL}/admin/cuestionarios/${codigo}/respuestas?usuario=${id_usuario}`, {  
      headers: { Authorization: `Bearer ${token}` },  
    })  
      .then((res) => res.json())  
      .then((data) => setDetalle(data))  
      .catch((err) => console.error("Error cargando detalle:", err));  
  };  
  
  if (loading) return <div>Cargando...</div>;  
  
  return (  
    <div>  
      <Navbar rol="admin" nombre={localStorage.getItem("nombre") || "Admin"} />  
      <div className="container mt-4">  
        <h2>Respuestas del Cuestionario: {codigo}</h2>  
        <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>  
          ← Volver  
        </button>  
  
        <table className="table table-striped">  
          <thead>  
            <tr>  
              <th>Empleado</th>  
              <th>Correo</th>  
              <th>Estado</th>  
              <th>Puntaje</th>  
              <th>Fecha</th>  
              <th>Acciones</th>  
            </tr>  
          </thead>  
          <tbody>  
            {empleados.map((emp) => (  
              <tr key={emp.id_usuario}>  
                <td>{emp.nombre}</td>  
                <td>{emp.correo}</td>  
                <td>  
                  <span className={`badge ${emp.estado === "completado" ? "bg-success" : "bg-warning"}`}>  
                    {emp.estado}  
                  </span>  
                </td>  
                <td>{emp.puntaje_total || 0} pts</td>  
                <td>{emp.fecha_respuesta ? new Date(emp.fecha_respuesta).toLocaleString() : "N/A"}</td>  
                <td>  
                  {emp.estado === "completado" && (  
                    <button  
                      className="btn btn-sm btn-primary"  
                      onClick={() => verDetalle(emp.id_usuario)}  
                    >  
                      Ver respuestas  
                    </button>  
                  )}  
                </td>  
              </tr>  
            ))}  
          </tbody>  
        </table>  
  
        {/* Modal de detalle */}  
        {detalle && (  
          <div className="modal d-block" tabIndex="-1" style={{ background: "#0003" }}>  
            <div className="modal-dialog modal-lg">  
              <div className="modal-content p-4">  
                <h5>  
                  Respuestas de {detalle.empleado.nombre} ({detalle.empleado.correo})  
                </h5>  
                <div className="mb-3">  
                  <strong>Puntaje Total:</strong> {detalle.puntajeTotal} pts  
                  <br />  
                  <strong>Estado:</strong>{" "}  
                  <span className={detalle.aprobado ? "text-success" : "text-danger"}>  
                    {detalle.aprobado ? "✓ Aprobado" : "✗ Reprobado"}  
                  </span>  
                </div>  
                <table className="table table-bordered mt-3">  
                  <thead>  
                    <tr>  
                      <th>Pregunta</th>  
                      <th>Respuesta</th>  
                      <th>Correcta</th>  
                      <th>Puntaje</th>  
                    </tr>  
                  </thead>  
                  <tbody>  
                    {detalle.respuestas.map((r) => (  
                      <tr key={r.id_pregunta}>  
                        <td>{r.pregunta}</td>  
                        <td>{r.respuesta}</td>  
                        <td>  
                          {r.es_correcta !== null && (  
                            <span className={r.es_correcta ? "text-success" : "text-danger"}>  
                              {r.es_correcta ? "✓ Correcta" : "✗ Incorrecta"}  
                            </span>  
                          )}  
                        </td>  
                        <td>  
                          {r.puntaje_obtenido} / {r.puntaje_total} pts  
                        </td>  
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