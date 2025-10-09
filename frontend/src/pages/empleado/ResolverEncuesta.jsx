// src/pages/empleado/ResolverEncuesta.jsx  
import { useEffect, useState } from "react";  
import { useParams, useNavigate } from "react-router-dom";  
import Navbar from "../../components/Navbar";  
import "../../css/ResolverEncuestaEmpleado.css";  
  
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";  
  
export default function ResolverEncuesta() {  
  const { codigo } = useParams();  
  const navigate = useNavigate();  
  const token = localStorage.getItem("token");  
  
  const [encuesta, setEncuesta] = useState(null);  
  const [respuestas, setRespuestas] = useState({});  
  const [loading, setLoading] = useState(true);  
  const [indiceSeccion, setIndiceSeccion] = useState(0);  
  const [mostrarIntro, setMostrarIntro] = useState(true); // 🆕 Estado para pantalla de introducción  
  const [finalizado, setFinalizado] = useState(false);  
  
  const rol = localStorage.getItem("rol") || "empleado";  
  const nombre = localStorage.getItem("nombre") || "Empleado";  
  
  // ====== Fetch  
  useEffect(() => {  
    fetch(`${API_URL}/empleado/encuestas/${codigo}`, {  
      headers: { Authorization: `Bearer ${token}` },  
    })  
      .then((res) => res.json())  
      .then((data) => {  
        setEncuesta(data);  
        setLoading(false);  
      })  
      .catch((err) => console.error("Error cargando encuesta:", err));  
  }, [codigo, token]);  
  
  // ====== Helpers  
  const setValor = (id_pregunta, valor) =>  
    setRespuestas((prev) => ({ ...prev, [id_pregunta]: valor }));  
  
  // Secciones visibles por condición  
  const seccionesVisibles = (encuesta?.Secciones || []).filter(  
    (sec) =>  
      !sec.condicion_pregunta_id ||  
      respuestas[sec.condicion_pregunta_id] === sec.condicion_valor  
  );  
  const total = seccionesVisibles.length || 1;  
  const actual = Math.min(indiceSeccion, total - 1);  
  const seccionActual = seccionesVisibles[actual];  
  const pct = Math.round(((actual + 1) / total) * 100);  
  
  const avanzar = () => actual < total - 1 && setIndiceSeccion((i) => i + 1);  
  const retroceder = () => actual > 0 && setIndiceSeccion((i) => i - 1);  
  
  const enviar = (finalizar) => {  
    const lista = [];  
    (encuesta?.Secciones || []).forEach((sec) =>  
      (sec.Preguntas || []).forEach((p) => {  
        const v = respuestas[p.id_pregunta];  
        if (v !== undefined) lista.push({ id_pregunta: p.id_pregunta, valor: v });  
      })  
    );  
  
    fetch(`${API_URL}/empleado/encuestas/${codigo}/respuestas`, {  
      method: "POST",  
      headers: {  
        "Content-Type": "application/json",  
        Authorization: `Bearer ${token}`,  
      },  
      body: JSON.stringify({ finalizar, respuestas: lista }),  
    })  
      .then((res) => res.json())  
      .then(() => {  
        if (finalizar) {  
          setFinalizado(true);  
        }  
      })  
      .catch((err) => console.error("Error enviando respuestas:", err));  
  };  
  
  if (loading) return <div className="gf-screen-center">Cargando encuesta…</div>;  
  if (!encuesta) return <div className="gf-screen-center">Encuesta no encontrada.</div>;  
  
  // 🆕 Pantalla de introducción con aceptación de datos  
  if (mostrarIntro) {  
    return (  
      <div className="gf-shell">  
        <Navbar rol={rol} nombre={nombre} />  
        <div className="gf-thanks-wrap">  
          <div className="gf-thanks-card">  
            <div className="gf-thanks-emoji">📋</div>  
            <h2 className="gf-thanks-title">{encuesta.titulo}</h2>  
              
            {encuesta.introduccion && (  
              <p className="gf-thanks-text">{encuesta.introduccion}</p>  
            )}  
  
            {encuesta.descripcion && (  
              <p className="gf-thanks-text text-muted">{encuesta.descripcion}</p>  
            )}  
  
            {/* Mensaje sobre uso de datos */}  
            <div className="mt-4 p-3 bg-light rounded">  
              <h6 className="mb-2">  
                <i className="bi bi-shield-check me-2"></i>  
                Uso de datos  
              </h6>  
              <p className="small mb-0">  
                Al continuar, aceptas que tus respuestas serán almacenadas en nuestra base de datos   
                para fines de análisis y mejora continua. Tus datos serán tratados de forma confidencial   
                y de acuerdo con nuestras políticas de privacidad.  
              </p>  
            </div>  
  
            {encuesta.tiempo_limite && (  
              <div className="mt-3 text-muted small">  
                <i className="bi bi-clock me-2"></i>  
                Tiempo estimado: {encuesta.tiempo_limite} minutos  
              </div>  
            )}  
  
            <div className="gf-thanks-actions mt-4">  
              <button  
                className="gf-btn gf-btn-outlined"  
                onClick={() => navigate("/empleado/dashboard")}  
              >  
                Cancelar  
              </button>  
              <button  
                className="gf-btn gf-btn-primary"  
                onClick={() => setMostrarIntro(false)}  
              >  
                Aceptar y comenzar  
              </button>  
            </div>  
          </div>  
        </div>  
      </div>  
    );  
  }  
  
  // ====== Pantalla de "Gracias"  
  if (finalizado) {  
    return (  
      <div className="gf-shell">  
        <Navbar rol={rol} nombre={nombre} />  
        <div className="gf-thanks-wrap">  
          <div className="gf-thanks-card">  
            <div className="gf-thanks-emoji">🎉</div>  
            <h2 className="gf-thanks-title">¡Gracias por participar!</h2>  
            <p className="gf-thanks-text">  
              Tus respuestas han sido registradas correctamente. Apreciamos el tiempo que  
              dedicaste a completar esta encuesta.  
            </p>  
  
            <div className="gf-thanks-actions">  
              <button  
                className="gf-btn gf-btn-primary"  
                onClick={() => navigate("/empleado/dashboard")}  
              >  
                Volver al panel  
              </button>  
            </div>  
          </div>  
        </div>  
      </div>  
    );  
  }  
  
  // ====== Pantalla normal de encuesta  
  return (  
    <div className="gf-shell">  
      <Navbar rol={rol} nombre={nombre} />  
  
      <header className="gf-header">  
        <div className="gf-header-card">  
          <h1 className="gf-title">{encuesta.titulo}</h1>  
          {encuesta.descripcion && (  
            <p className="gf-subtitle">{encuesta.descripcion}</p>  
          )}  
          <div className="gf-progress">  
            <div className="gf-progress-bar" style={{ width: `${pct}%` }} />  
          </div>  
          <span className="gf-progress-text">  
            {actual + 1} / {total}  
          </span>  
        </div>  
      </header>  
  
      <main className="gf-main">  
        {seccionActual && (  
          <section className="gf-section-card">  
            <div className="gf-section-head">  
              <h2 className="gf-section-title">{seccionActual.nombre_seccion}</h2>  
              {seccionActual.descripcion && (  
                <p className="gf-section-desc">{seccionActual.descripcion}</p>  
              )}  
            </div>  
  
            <div className="gf-questions">  
              {seccionActual.Preguntas.map((p, idx) => (  
                <PreguntaInput  
                  key={p.id_pregunta}  
                  index={idx + 1}  
                  pregunta={p}  
                  valor={respuestas[p.id_pregunta]}  
                  setValor={setValor}  
                />  
              ))}  
            </div>  
          </section>  
        )}  
  
        <div className="gf-nav">  
          <button className="gf-btn gf-btn-text" disabled={actual === 0} onClick={retroceder}>  
            ← Anterior  
          </button>  
  
          {actual < total - 1 ? (  
            <div className="gf-nav-right">  
              <button className="gf-btn gf-btn-outlined" onClick={() => enviar(false)}>  
                Guardar  
              </button>  
              <button className="gf-btn gf-btn-primary" onClick={avanzar}>  
                Siguiente →  
              </button>  
            </div>  
          ) : (  
            <div className="gf-nav-right">  
              <button className="gf-btn gf-btn-outlined" onClick={() => enviar(false)}>  
                Guardar  
              </button>  
              <button className="gf-btn gf-btn-primary" onClick={() => enviar(true)}>  
                Enviar  
              </button>  
            </div>  
          )}  
        </div>  
      </main>  
    </div>  
  );  
}  
  
/* ===== UI preguntas ===== */  
function PreguntaInput({ index, pregunta, valor, setValor }) {  
  const etiqueta = (  
    <div className="gf-q-label">  
      <span className="gf-q-index">{index}</span>  
      <span className="gf-q-text">{pregunta.enunciado}</span>  
    </div>  
  );  
  
  switch (pregunta.tipo_pregunta) {  
    case "respuesta_corta":  
      return (  
        <div className="gf-q">  
          {etiqueta}  
          <input  
            type="text"  
            className="gf-input"  
            value={valor || ""}  
            onChange={(e) => setValor(pregunta.id_pregunta, e.target.value)}  
            placeholder="Tu respuesta"  
          />  
        </div>  
      );  
  
    case "opcion_multiple":  
      return (  
        <div className="gf-q">  
          {etiqueta}  
          <div className="gf-options">  
            {pregunta.Opciones.map((opt) => {  
              const checked = Array.isArray(valor) && valor.includes(opt.texto);  
              return (  
                <label key={opt.id_opcion} className={`gf-opt ${checked ? "is-checked" : ""}`}>  
                  <input  
                    type="checkbox"  
                    checked={checked}  
                    onChange={(e) => {  
                      let arr = Array.isArray(valor) ? [...valor] : [];  
                      if (e.target.checked) arr.push(opt.texto);  
                      else arr = arr.filter((v) => v !== opt.texto);  
                      setValor(pregunta.id_pregunta, arr);  
                    }}  
                  />  
                  <span>{opt.texto}</span>  
                </label>  
              );  
            })}  
          </div>  
        </div>  
      );  
  
    case "seleccion_unica":  
      return (  
        <div className="gf-q">  
          {etiqueta}  
          <div className="gf-options">  
            {pregunta.Opciones.map((opt) => (  
              <label  
                key={opt.id_opcion}  
                className={`gf-opt ${valor === opt.texto ? "is-checked" : ""}`}  
              >  
                <input  
                  type="radio"  
                  name={`p-${pregunta.id_pregunta}`}  
                  checked={valor === opt.texto}  
                  onChange={() => setValor(pregunta.id_pregunta, opt.texto)}  
                />  
                <span>{opt.texto}</span>  
              </label>  
            ))}  
          </div>  
        </div>  
      );  
  
    case "si_no":  
    case "condicional":  
      return (  
        <div className="gf-q">  
          {etiqueta}  
          <div className="gf-options">  
            {["si", "no"].map((v) => (  
              <label key={v} className={`gf-opt ${valor === v ? "is-checked" : ""}`}>  
                <input  
                  type="radio"  
                  name={`p-${pregunta.id_pregunta}`}  
                  value={v}  
                  checked={valor === v}  
                  onChange={() => setValor(pregunta.id_pregunta, v)}  
                />  
                <span>{v === "si" ? "Sí" : "No"}</span>  
              </label>  
            ))}  
          </div>  
        </div>  
      );  
  
    case "escala_1_5":  
      return (  
        <div className="gf-q">  
          {etiqueta}  
          <div className="gf-scale">  
            {[1, 2, 3, 4, 5].map((n) => (  
              <label key={n} className={`gf-chip ${valor === n ? "is-checked" : ""}`}>  
                <input  
                  type="radio"  
                  name={`p-${pregunta.id_pregunta}`}  
                  checked={valor === n}  
                  onChange={() => setValor(pregunta.id_pregunta, n)}  
                />  
                <span>{n}</span>  
              </label>  
            ))}  
          </div>  
        </div>  
      );  
  
    default:  
      return (  
        <div className="gf-q">  
          {etiqueta}  
          <p className="gf-muted">Tipo no soportado</p>  
        </div>  
      );  
  }  
}