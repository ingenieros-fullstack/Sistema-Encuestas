import { useEffect, useState } from "react";  
import { useParams, useNavigate } from "react-router-dom";  
import Navbar from "../../components/Navbar";  
  
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";  
  
export default function ResolverCuestionarioEmpleado() {  
  const { codigo } = useParams();  
  const navigate = useNavigate();  
  const token = localStorage.getItem("token");  
  
  const [cuestionario, setCuestionario] = useState(null);  
  const [respuestas, setRespuestas] = useState({});  
  const [loading, setLoading] = useState(true);  
  const [indiceSeccion, setIndiceSeccion] = useState(0);  
  const [resultado, setResultado] = useState(null);  
  
  const rol = localStorage.getItem("rol") || "empleado";  
  const nombre = localStorage.getItem("nombre") || "Empleado";  
  
  // Fetch cuestionario con manejo de errores mejorado  
  useEffect(() => {  
    fetch(`${API_URL}/empleado/cuestionarios/${codigo}`, {  
      headers: { Authorization: `Bearer ${token}` },  
    })  
      .then((res) => {  
        if (!res.ok) {  
          if (res.status === 403) {  
            return res.json().then(data => {  
              if (data.completado) {  
                alert("Este cuestionario ya fue completado");  
                navigate("/empleado/dashboard");  
              }  
              throw new Error(data.error || "No tienes acceso a este cuestionario");  
            });  
          }  
          throw new Error("Error al cargar cuestionario");  
        }  
        return res.json();  
      })  
      .then((data) => {  
        setCuestionario(data);  
        setLoading(false);  
      })  
      .catch((err) => {  
        console.error("Error cargando cuestionario:", err);  
        alert(err.message);  
        navigate("/empleado/dashboard");  
      });  
  }, [codigo, token, navigate]);  
  
  const setValor = (id_pregunta, valor) => {  
    setRespuestas((prev) => ({ ...prev, [id_pregunta]: valor }));  
  };  
  
  const enviarRespuestas = async () => {  
    // Normalizar respuestas antes de enviar  
    const respuestasNormalizadas = Object.entries(respuestas).map(([id_pregunta, valor]) => {  
      let valorNormalizado = valor;  
        
      // Normalizar según el tipo de valor  
      if (typeof valor === 'string') {  
        valorNormalizado = valor.toLowerCase().trim();  
      } else if (Array.isArray(valor)) {  
        // Para opciones múltiples, ordenar y normalizar  
        valorNormalizado = valor  
          .map(v => v.toLowerCase().trim())  
          .sort()  
          .join(";");  
      } else if (typeof valor === 'number') {  
        valorNormalizado = String(valor);  
      }  
  
      return {  
        id_pregunta: parseInt(id_pregunta),  
        respuesta: valorNormalizado,  
      };  
    });  
  
    try {  
      const res = await fetch(`${API_URL}/empleado/cuestionarios/${codigo}/respuestas`, {  
        method: "POST",  
        headers: {  
          "Content-Type": "application/json",  
          Authorization: `Bearer ${token}`,  
        },  
        body: JSON.stringify({ respuestas: respuestasNormalizadas }),  
      });  
  
      if (!res.ok) {  
        const errorData = await res.json();  
        throw new Error(errorData.error || "Error al enviar respuestas");  
      }  
  
      const data = await res.json();  
      setResultado({  
        puntajeTotal: data.puntajeTotal,  
        respuestasDetalle: data.respuestas || [],  
      });  
    } catch (err) {  
      console.error("Error enviando respuestas:", err);  
      alert(err.message);  
    }  
  };  
  
  if (loading) return <p className="p-6">⏳ Cargando cuestionario...</p>;  
  if (!cuestionario) return <p className="p-6">❌ No se pudo cargar el cuestionario</p>;  
  
  // Pantalla de resultados  
  if (resultado) {  
    const puntajeMaximo = (cuestionario.Secciones || [])  
      .flatMap((s) => s.Preguntas || [])  
      .reduce((acc, p) => acc + (p.puntaje || 0), 0);  
      
    const porcentaje = puntajeMaximo > 0 ? (resultado.puntajeTotal / puntajeMaximo) * 100 : 0;  
    const aprobado = porcentaje >= (cuestionario.umbral_aprobacion || 0);  
  
    return (  
      <div>  
        <Navbar nombre={nombre} rol={rol} />  
        <div className="container py-5">  
          <div className="card shadow-lg border-0">  
            <div className="card-body p-5">  
              {/* Encabezado con estado */}  
              <div className="text-center mb-4">  
                <div className={`badge ${aprobado ? 'bg-success' : 'bg-danger'} fs-5 mb-3`}>  
                  {aprobado ? '✓ APROBADO' : '✗ NO APROBADO'}  
                </div>  
                <h2 className="h3 mb-3">{cuestionario.titulo}</h2>  
                <div className="d-flex justify-content-center gap-4 mb-3">  
                  <div>  
                    <div className="text-muted small">Puntaje obtenido</div>  
                    <div className="h4 mb-0">{resultado.puntajeTotal} / {puntajeMaximo}</div>  
                  </div>  
                  <div>  
                    <div className="text-muted small">Porcentaje</div>  
                    <div className="h4 mb-0">{porcentaje.toFixed(1)}%</div>  
                  </div>  
                  <div>  
                    <div className="text-muted small">Umbral requerido</div>  
                    <div className="h4 mb-0">{cuestionario.umbral_aprobacion}%</div>  
                  </div>  
                </div>  
              </div>  
  
              {/* Mostrar respuestas correctas si está habilitado */}  
              {cuestionario.mostrar_respuestas && resultado.respuestasDetalle && (  
                <div className="mt-4">  
                  <h5 className="mb-3">Revisión de respuestas</h5>  
                  {resultado.respuestasDetalle.map((detalle, idx) => (  
                    <div   
                      key={idx}   
                      className={`p-3 mb-2 rounded ${detalle.es_correcta ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}  
                    >  
                      <p className="mb-1 fw-semibold">{detalle.pregunta}</p>  
                      <p className="mb-1">  
                        <span className="text-muted">Tu respuesta:</span> {detalle.respuesta}  
                      </p>  
                      {detalle.respuesta_correcta && (  
                        <p className="mb-1">  
                          <span className="text-muted">Respuesta correcta:</span> {detalle.respuesta_correcta}  
                        </p>  
                      )}  
                      <p className={detalle.es_correcta ? 'text-success' : 'text-danger'}>  
                        {detalle.es_correcta ? '✓' : '✗'}{' '}  
                        {detalle.es_correcta ? 'Correcta' : 'Incorrecta'} -{' '}  
                        {detalle.puntaje_obtenido} / {detalle.puntaje_total} pts  
                      </p>  
                    </div>  
                  ))}  
                </div>  
              )}  
  
              <div className="mt-4">  
                <button  
                  onClick={() => navigate("/empleado/dashboard")}  
                  className="btn btn-primary"  
                >  
                  Volver al Dashboard  
                </button>  
              </div>  
  
              <div className="mt-4 p-4 bg-blue-50 rounded">  
                <p className="text-sm text-gray-700">  
                  ℹ️ Este cuestionario ha sido completado y guardado. No es posible volver a responderlo.  
                </p>  
              </div>  
            </div>  
          </div>  
        </div>  
      </div>  
    );  
  }  
  
  // Filtrar secciones visibles  
  const seccionesVisibles = (cuestionario?.Secciones || []).filter(  
    (sec) =>  
      !sec.condicion_pregunta_id ||  
      respuestas[sec.condicion_pregunta_id] === sec.condicion_valor  
  );  
  
  if (seccionesVisibles.length === 0) {  
    return <p className="p-6">⚠️ No hay más secciones disponibles.</p>;  
  }  
  
  const seccionActual = seccionesVisibles[indiceSeccion];  
  const esUltimaSeccion = indiceSeccion === seccionesVisibles.length - 1;  
  
  const avanzarSeccion = () => {  
    if (esUltimaSeccion) {  
      enviarRespuestas();  
    } else {  
      setIndiceSeccion((prev) => prev + 1);  
    }  
  };  
  
  const retrocederSeccion = () => {  
    if (indiceSeccion > 0) setIndiceSeccion((prev) => prev - 1);  
  };  
  
  return (  
    <div>  
      <Navbar nombre={nombre} rol={rol} />  
      <div className="container py-5">  
        <div className="card shadow">  
          <div className="card-body">  
            <h2 className="h4 mb-3">{cuestionario.titulo}</h2>  
            <p className="text-muted mb-4">  
              Sección {indiceSeccion + 1} de {seccionesVisibles.length}  
            </p>  
  
            <h3 className="h5 mb-3">{seccionActual.nombre_seccion}</h3>  
  
            {(seccionActual.Preguntas || []).map((pregunta) => (  
              <PreguntaInput  
                key={pregunta.id_pregunta}  
                pregunta={pregunta}  
                valor={respuestas[pregunta.id_pregunta]}  
                setValor={setValor}  
              />  
            ))}  
  
            <div className="d-flex justify-content-between mt-4">  
              {cuestionario.navegacion_preguntas && indiceSeccion > 0 && (  
                <button className="btn btn-secondary" onClick={retrocederSeccion}>  
                  ← Anterior  
                </button>  
              )}  
              <button className="btn btn-primary ms-auto" onClick={avanzarSeccion}>  
                {esUltimaSeccion ? "Finalizar" : "Siguiente →"}  
              </button>  
            </div>  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
}  
  
function PreguntaInput({ pregunta, valor, setValor }) {  
  const opciones = pregunta.Opciones || [];  
  
  switch (pregunta.tipo_pregunta) {  
    case "respuesta_corta":  
      return (  
        <div className="mb-3">  
          <label className="font-medium">{pregunta.enunciado}</label>  
          {pregunta.puntaje && (  
            <span className="ml-2 text-sm text-gray-500">({pregunta.puntaje} pts)</span>  
          )}  
          <input  
            type="text"  
            className="form-control mt-2"  
            value={valor || ""}  
            onChange={(e) => setValor(pregunta.id_pregunta, e.target.value)}  
          />  
        </div>  
      );  
  
    case "opcion_multiple":  
      return (  
        <div className="mb-3">  
          <label className="font-medium">{pregunta.enunciado}</label>  
          {pregunta.puntaje && (  
            <span className="ml-2 text-sm text-gray-500">({pregunta.puntaje} pts)</span>  
          )}  
          <div className="mt-2">  
            {opciones.map((opt) => (  
              <div key={opt.id_opcion} className="mb-1">  
                <input  
                  type="checkbox"  
                  checked={valor?.includes(opt.texto) || false}  
                  onChange={(e) => {  
                    let arr = Array.isArray(valor) ? [...valor] : [];  
                    if (e.target.checked) arr.push(opt.texto);  
                    else arr = arr.filter((v) => v !== opt.texto);  
                    setValor(pregunta.id_pregunta, arr);  
                  }}  
                />  
                <span className="ml-2">{opt.texto}</span>  
              </div>  
            ))}  
          </div>  
        </div>  
      );  
  
    case "seleccion_unica":  
      return (  
        <div className="mb-3">  
          <label className="font-medium">{pregunta.enunciado}</label>  
          {pregunta.puntaje && (  
            <span className="ml-2 text-sm text-gray-500">({pregunta.puntaje} pts)</span>  
          )}  
          <div className="mt-2">  
            {opciones.map((opt) => (  
              <div key={opt.id_opcion} className="mb-1">  
                <input  
                  type="radio"  
                  name={`p-${pregunta.id_pregunta}`}  
                  checked={valor === opt.texto}  
                  onChange={() => setValor(pregunta.id_pregunta, opt.texto)}  
                />  
                <span className="ml-2">{opt.texto}</span>  
              </div>  
            ))}  
          </div>  
        </div>  
      );  
  
    case "si_no":  
      return (  
        <div className="mb-3">  
          <label className="font-medium">{pregunta.enunciado}</label>  
          {pregunta.puntaje && (  
            <span className="ml-2 text-sm text-gray-500">({pregunta.puntaje} pts)</span>  
          )}  
          <div className="mt-2">  
            <label className="me-3">  
              <input  
                type="radio"  
                name={`p-${pregunta.id_pregunta}`}  
                value="si"  
                checked={valor === "si"}  
                onChange={() => setValor(pregunta.id_pregunta, "si")}  
              />{" "}  
              Sí  
            </label>  
            <label>  
              <input  
                type="radio"  
                name={`p-${pregunta.id_pregunta}`}  
                value="no"  
                checked={valor === "no"}  
                onChange={() => setValor(pregunta.id_pregunta, "no")}  
              />{" "}  
              No  
            </label>  
          </div>  
        </div>  
      );  

      case "escala_1_5":  
  return (  
    <div className="mb-3">  
      <label className="font-medium">{pregunta.enunciado}</label>  
      {pregunta.puntaje && (  
        <span className="ml-2 text-sm text-gray-500">({pregunta.puntaje} pts)</span>  
      )}  
      <div className="flex gap-2 mt-2">  
        {[1, 2, 3, 4, 5].map((n) => (  
          <label key={n}>  
            <input  
              type="radio"  
              name={`p-${pregunta.id_pregunta}`}  
              checked={valor === n}  
              onChange={() => setValor(pregunta.id_pregunta, n)}  
            />  
            {n}  
          </label>  
        ))}  
      </div>  
    </div>  
  );  
  
default:  
  return <p className="text-gray-500 italic">Tipo no soportado</p>;
}}