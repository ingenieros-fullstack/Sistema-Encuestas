import { useEffect, useMemo, useState, useCallback } from "react";  
import { useParams, useNavigate } from "react-router-dom";  
import Introduccion from "../../components/cuestionario/Introduccion";  
import Seccion from "../../components/encuestas/Seccion";  // 🔄 CAMBIO: usar componente de encuestas  
import MensajeFinal from "../../components/cuestionario/MensajeFinal";  
import "../../css/ResolverCuestionarioAdmin.css";  
  
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";  
  
export default function ResolverCuestionarioAdmin() {  
  const { codigo } = useParams();  
  const navigate = useNavigate();  
  
  const [cuestionario, setCuestionario] = useState(null);  
  const [respuestas, setRespuestas] = useState({});  
  const [error, setError] = useState("");  
  const [mostrarIntro, setMostrarIntro] = useState(true);  
  const [finalizado, setFinalizado] = useState(false);  
  const [idx, setIdx] = useState(0);  
  
  // Carga del cuestionario  
  useEffect(() => {  
    const token = localStorage.getItem("token");  
    fetch(`${API_URL}/admin/cuestionarios/${codigo}/preview`, {  
      headers: { Authorization: `Bearer ${token}` },  
    })  
      .then((res) => {  
        if (!res.ok) throw new Error("Error al cargar cuestionario");  
        return res.json();  
      })  
      .then(setCuestionario)  
      .catch((err) => {  
        console.error("❌ Error cargando cuestionario:", err);  
        setError("No se pudo cargar el cuestionario. Verifica si existe.");  
      });  
  }, [codigo]);  
  
  // Manejo de respuestas  
  const handleRespuesta = useCallback((id_pregunta, valor) => {  
    setRespuestas((prev) => ({ ...prev, [id_pregunta]: valor }));  
  }, []);  
  
  const enviarRespuestas = useCallback(() => {  
    alert("⚠️ Modo Admin: respuestas no se guardan, solo es una prueba ✅");  
    setFinalizado(true);  
  }, []);  
  
  const secciones = cuestionario?.Secciones || [];  
  const totalSecciones = secciones.length;  
  const active = secciones[idx];  
  
  // Cálculo de progreso global  
  const progresoGlobal = useMemo(() => {  
    const total = secciones.reduce((acc, s) => acc + (s.Preguntas?.length || 0), 0);  
    if (!total) return 0;  
    let contestadas = 0;  
    secciones.forEach((s) =>  
      s.Preguntas?.forEach((p) => {  
        const v = respuestas[p.id_pregunta];  
        if (v !== undefined && v !== null && String(v).length > 0) contestadas++;  
      })  
    );  
    return Math.round((contestadas / total) * 100);  
  }, [secciones, respuestas]);  
  
  // Cálculo de progreso por sección  
  const progresoSeccion = useMemo(() => {  
    if (!active) return 0;  
    const tot = active.Preguntas?.length || 0;  
    if (!tot) return 0;  
    const ans =  
      active.Preguntas?.filter((p) => {  
        const v = respuestas[p.id_pregunta];  
        return v !== undefined && v !== null && String(v).length > 0;  
      }).length || 0;  
    return Math.round((ans / tot) * 100);  
  }, [active, respuestas]);  
  
  // Navegación  
  const goTo = (i) => {  
    if (i < 0 || i >= totalSecciones) return;  
    setIdx(i);  
    window.scrollTo({ top: 0, behavior: "smooth" });  
  };  
  
  const goNext = () => goTo(idx + 1);  
  const goPrev = () => goTo(idx - 1);  
  
  // Estados de error y carga  
  if (error) {  
    return (  
      <div className="container py-5">  
        <div className="alert alert-danger text-center">  
          <h5 className="mb-2">Se produjo un error</h5>  
          <p className="mb-0">{error}</p>  
        </div>  
      </div>  
    );  
  }  
  if (!cuestionario) return <p className="container py-5">⏳ Cargando cuestionario…</p>;  
  
  // Mostrar introducción  
  if (mostrarIntro) {  
    return (  
      <Introduccion  
        titulo={cuestionario.titulo}  
        introduccion={cuestionario.introduccion}  
        tiempoLimite={cuestionario.tiempo_limite}  
        onComenzar={() => setMostrarIntro(false)}  
      />  
    );  
  }  
  
  // Mostrar mensaje final  
  if (finalizado) {  
    return (  
      <MensajeFinal textoFinal={cuestionario.texto_final || "Has terminado la prueba de este cuestionario."} />  
    );  
  }  
  
  // Lista de secciones (sidebar/offcanvas)  
  const SectionList = () => (  
    <ul className="list-group list-group-flush">  
      {secciones.map((s, i) => {  
        const tot = s.Preguntas?.length || 0;  
        const ans =  
          s.Preguntas?.filter((p) => {  
            const v = respuestas[p.id_pregunta];  
            return v !== undefined && v !== null && String(v).length > 0;  
          }).length || 0;  
        const done = tot ? Math.round((ans / tot) * 100) : 0;  
  
        return (  
          <li  
            key={s.id_seccion ?? i}  
            className={`list-group-item d-flex align-items-center justify-content-between ${i === idx ? "active-section" : ""}`}  
          >  
            <button  
              className="btn btn-link link-body-emphasis text-start text-decoration-none flex-grow-1"  
              data-bs-dismiss="offcanvas"  
              onClick={() => goTo(i)}  
            >  
              <div className="d-flex align-items-center gap-2">  
                <span className="badge rounded-pill text-bg-dark">{i + 1}</span>  
                <span className="text-truncate">{s.nombre_seccion}</span>  
              </div>  
            </button>  
            <span className={`badge rounded-pill ${done === 100 ? "text-bg-success" : "text-bg-secondary"}`}>  
              {done}%  
            </span>  
          </li>  
        );  
      })}  
    </ul>  
  );  
  
  // UI principal  
  return (  
    <div className="resolver-bg">  
      {/* Topbar */}  
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-secondary-subtle">  
        <div className="container-fluid">  
          <div className="d-flex align-items-center gap-2">  
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate(-1)}>  
              ← Volver  
            </button>  
  
            {/* Móvil: abrir secciones */}  
            <button  
              className="btn btn-outline-light btn-sm d-inline-flex d-lg-none"  
              type="button"  
              data-bs-toggle="offcanvas"  
              data-bs-target="#offcanvasSecciones"  
              aria-controls="offcanvasSecciones"  
            >  
              ☰ Secciones  
            </button>  
          </div>  
  
          <span className="navbar-brand fw-semibold text-truncate ms-2 ms-lg-0">  
            {cuestionario.titulo}  
          </span>  
  
          <div className="ms-auto d-flex align-items-center gap-2">  
            <span className="badge text-bg-secondary d-none d-sm-inline">Demo Admin</span>  
          </div>  
        </div>  
      </nav>  
  
      {/* Offcanvas secciones (móvil) */}  
      <div className="offcanvas offcanvas-start text-bg-dark" tabIndex={-1} id="offcanvasSecciones" aria-labelledby="offcanvasSeccionesLabel">  
        <div className="offcanvas-header">  
          <h5 className="offcanvas-title" id="offcanvasSeccionesLabel">Secciones</h5>  
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close" />  
        </div>  
        <div className="offcanvas-body">  
          <div className="card glass border-0 mb-3">  
            <div className="card-body">  
              <div className="d-flex justify-content-between align-items-center mb-2">  
                <small className="text-body-secondary">Progreso global</small>  
                <small className="fw-semibold">{progresoGlobal}%</small>  
              </div>  
              <div className="progress" role="progressbar" aria-valuenow={progresoGlobal} aria-valuemin={0} aria-valuemax={100}>  
                <div className="progress-bar" style={{ width: `${progresoGlobal}%` }} />  
              </div>  
            </div>  
          </div>  
          <div className="card glass border-0">  
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">  
              <strong>Secciones</strong>  
              <span className="badge rounded-pill text-bg-secondary">{idx + 1}/{totalSecciones}</span>  
            </div>  
            <SectionList />  
          </div>  
        </div>  
      </div>  
  
      {/* Layout principal */}  
      <div className="container py-4 pb-6-md mobile-container">  
        <div className="row g-4">  
          {/* Sidebar (desktop) */}  
          <aside className="col-12 col-lg-4 d-none d-lg-block">  
            <div className="position-sticky" style={{ top: "84px" }}>  
              <div className="card glass border-0 mb-3">  
                <div className="card-body">  
                  <div className="d-flex justify-content-between align-items-center mb-2">  
                    <small className="text-body-secondary">Progreso global</small>  
                    <small className="fw-semibold">{progresoGlobal}%</small>  
                  </div>  
                  <div className="progress" role="progressbar" aria-valuenow={progresoGlobal} aria-valuemin={0} aria-valuemax={100}>  
                    <div className="progress-bar" style={{ width: `${progresoGlobal}%` }} />  
                  </div>  
                </div>  
              </div>  
  
              <div className="card glass border-0">  
                <div className="card-header bg-transparent d-flex justify-content-between align-items-center">  
                  <strong>Secciones</strong>  
                  <span className="badge rounded-pill text-bg-secondary">{idx + 1}/{totalSecciones}</span>  
                </div>  
                <SectionList />  
              </div>  
            </div>  
          </aside>  
  
          {/* Contenido */}  
          <section className="col-12 col-lg-8">  
            <div className="mb-3">  
              <div className="d-flex justify-content-between align-items-center mb-2">  
                <h5 className="mb-0 section-heading">{active?.nombre_seccion}</h5>  
                <span className="badge rounded-pill text-bg-secondary">{progresoSeccion}% sección</span>  
              </div>  
              <div className="progress mb-3">  
                <div className="progress-bar bg-secondary" style={{ width: `${progresoSeccion}%` }} />  
              </div>  
  
              {active ? (  
                <Seccion  
                  seccion={active}  
                  index={idx}  
                  totalSecciones={totalSecciones}  
                  modo="preview"  
                  respuestas={respuestas}  
                  onRespuesta={handleRespuesta}  
                  onFinalizar={idx === totalSecciones - 1 ? enviarRespuestas : null}  
                />  
              ) : (  
                <p className="text-body-secondary">No hay preguntas en esta sección.</p>  
              )}  
            </div>  
  
            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-between">  
              <button className="btn btn-outline-secondary w-100 w-sm-auto" disabled={idx === 0} onClick={goPrev}>  
                ← Anterior  
              </button>  
              <button className="btn btn-primary w-100 w-sm-auto" onClick={goNext}>  
                Siguiente →  
              </button>  
            </div>  
          </section>  
        </div>  
      </div>  
  
      {/* Barra de acciones */}  
      <div className="actionbar">  
        <div className="container d-flex flex-wrap gap-2 align-items-center justify-content-between">  
          <div className="small text-body-secondary d-none d-sm-block">  
            Usa <strong>← / →</strong> para navegar  
          </div>  
          <div className="d-flex gap-2 w-100 w-sm-auto">  
            <button className="btn btn-outline-secondary flex-fill flex-sm-unset" onClick={() => alert("Guardado local (demo)")}>  
              Guardar (demo)  
            </button>  
            <button className="btn btn-success flex-fill flex-sm-unset" onClick={enviarRespuestas}>  
              Enviar cuestionario (demo)  
            </button>  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
}