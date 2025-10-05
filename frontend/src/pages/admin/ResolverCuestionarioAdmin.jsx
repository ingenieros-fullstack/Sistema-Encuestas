// src/pages/admin/ResolverCuestionarioAdmin.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Seccion from "../../components/Seccion";
import Introduccion from "../../components/cuestionario/Introduccion";
import MensajeFinal from "../../components/cuestionario/MensajeFinal";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../css/ResolverCuestionarioAdmin.css";

/* ============================
   Helpers de normalización
   ============================ */
const getSections = (q) => {
  if (!q) return [];
  return (
    q.Seccions ||        // variante 1
    q.Secciones ||       // variante 2 (habitual)
    q.secciones ||       // por si viene en minúscula
    []
  );
};

const getQuestions = (sec) => {
  if (!sec) return [];
  return (
    sec.Pregunta ||      // singular (lo que tenías)
    sec.Preguntas ||     // plural (común)
    sec.preguntas ||     // minúscula
    []
  );
};

const getSectionName = (sec, i) =>
  sec?.nombre_seccion || sec?.nombre || sec?.titulo || `Sección ${i + 1}`;

export default function ResolverCuestionarioAdmin() {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const [cuestionario, setCuestionario] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [finalizado, setFinalizado] = useState(false);
  const [aprobado, setAprobado] = useState(null);
  const [idx, setIdx] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  /* =========== Carga =========== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/admin/cuestionarios/${codigo}/preview`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log("Preview cuestionario:", data);
        setCuestionario(data);
      })
      .catch((err) => console.error("Error cargando cuestionario:", err));
  }, [codigo]);

  /* =========== Manejo de respuestas =========== */
  const handleRespuesta = useCallback((idPregunta, respuesta) => {
    setRespuestas((prev) => ({ ...prev, [idPregunta]: respuesta }));
  }, []);

  /* =========== Progresos =========== */
  const secciones = getSections(cuestionario);
  const totalSecciones = secciones.length;
  const activa = secciones[idx];

  const progresoGlobal = useMemo(() => {
    const total = secciones.reduce((acc, s) => acc + getQuestions(s).length, 0);
    if (!total) return 0;
    let contestadas = 0;
    secciones.forEach((s) =>
      getQuestions(s).forEach((p) => {
        const v = respuestas[p.id_pregunta];
        if (v !== undefined && v !== null && String(v).length > 0) contestadas++;
      })
    );
    return Math.round((contestadas / total) * 100);
  }, [secciones, respuestas]);

  const progresoSeccion = useMemo(() => {
    if (!activa) return 0;
    const tot = getQuestions(activa).length;
    if (!tot) return 0;
    const ans = getQuestions(activa).filter((p) => {
      const v = respuestas[p.id_pregunta];
      return v !== undefined && v !== null && String(v).length > 0;
    }).length;
    return Math.round((ans / tot) * 100);
  }, [activa, respuestas]);

  /* =========== Navegación =========== */
  const goTo = (i) => {
    if (i < 0 || i >= totalSecciones) return;
    setIdx(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goNext = () => goTo(idx + 1);
  const goPrev = () => goTo(idx - 1);

  /* =========== Finalizar / Evaluar =========== */
  const handleFinalizar = () => {
    if (!cuestionario) return;

    let puntajeTotal = 0;
    let puntajeMaximo = 0;

    secciones.forEach((sec) => {
      getQuestions(sec).forEach((preg) => {
        puntajeMaximo += preg.puntaje || 0;
        if (preg.respuesta_correcta) {
          const v = respuestas[preg.id_pregunta];
          if (typeof v === "string" && typeof preg.respuesta_correcta === "string") {
            if (v.trim() === preg.respuesta_correcta.trim()) puntajeTotal += preg.puntaje || 0;
          } else if (v === preg.respuesta_correcta) {
            puntajeTotal += preg.puntaje || 0;
          }
        }
      });
    });

    const isAprobado =
      cuestionario?.umbral_aprobacion && puntajeMaximo > 0
        ? puntajeTotal >= cuestionario.umbral_aprobacion
        : true;

    setAprobado(isAprobado);
    setFinalizado(true);
  };

  if (!cuestionario) {
    return <p className="container py-5 text-center text-white-50">Cargando cuestionario…</p>;
  }

  /* =========== Listado de secciones (reutilizable) =========== */
  const SectionList = () => (
    <ul className="list-group list-group-flush">
      {secciones.map((s, i) => {
        const qs = getQuestions(s);
        const tot = qs.length;
        const ans = qs.filter((p) => {
          const v = respuestas[p.id_pregunta];
          return v !== undefined && v !== null && String(v).length > 0;
        }).length;
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
                <span className="text-truncate">{getSectionName(s, i)}</span>
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

  /* =========== UI =========== */
  return (
    <div className="cuest-bg">
      {/* Topbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-secondary-subtle">
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate(-1)}>
              ← Volver
            </button>
            <button
              className="btn btn-outline-light btn-sm d-inline-flex d-lg-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasSeccionesC"
              aria-controls="offcanvasSeccionesC"
            >
              ☰ Secciones
            </button>
          </div>

          <span className="navbar-brand fw-semibold text-truncate ms-2 ms-lg-0">
            {cuestionario.titulo}
          </span>

          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="badge text-bg-secondary">Demo Admin</span>
          </div>
        </div>
      </nav>

      {/* Intro */}
      <div className="container py-4">
        <div className="card glass border-0 mb-4">
          <div className="card-body">
            <Introduccion titulo={cuestionario.titulo} texto={cuestionario.introduccion} />
          </div>
        </div>
      </div>

      {/* Offcanvas (móvil) */}
      <div
        className="offcanvas offcanvas-start text-bg-dark"
        tabIndex={-1}
        id="offcanvasSeccionesC"
        aria-labelledby="offcanvasSeccionesCLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasSeccionesCLabel">Secciones</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body">
          <div className="card glass border-0 mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-body-secondary">Progreso global</small>
                <small className="fw-semibold">{progresoGlobal}%</small>
              </div>
              <div className="progress">
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
      <div className="container pb-6-md">
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
                  <div className="progress">
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
            <div className="card glass border-0 mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0 section-heading">{getSectionName(activa, idx)}</h5>
                  <span className="badge rounded-pill text-bg-secondary">{progresoSeccion}% sección</span>
                </div>
                <div className="progress mb-3">
                  <div className="progress-bar" style={{ width: `${progresoSeccion}%` }} />
                </div>

                {!finalizado ? (
                  <>
                    {activa ? (
                      <Seccion
                        seccion={activa}
                        modo="resolver"
                        respuestas={respuestas}
                        onResponder={handleRespuesta}
                      />
                    ) : (
                      <p className="text-body-secondary mb-0">No hay preguntas en esta sección.</p>
                    )}

                    <div className="d-flex flex-column flex-sm-row gap-2 justify-content-between mt-3">
                      <button className="btn btn-outline-secondary w-100 w-sm-auto" disabled={idx === 0} onClick={goPrev}>
                        ← Anterior
                      </button>
                      {idx < totalSecciones - 1 ? (
                        <button className="btn btn-primary w-100 w-sm-auto" onClick={goNext}>
                          Siguiente →
                        </button>
                      ) : (
                        <button className="btn btn-success w-100 w-sm-auto" onClick={handleFinalizar}>
                          Finalizar cuestionario
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <MensajeFinal texto={cuestionario.texto_final} aprobado={aprobado} />
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Barra inferior (atajos) */}
      <div className="actionbar">
        <div className="container d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <div className="small text-body-secondary d-none d-sm-block">
            Usa <strong>← / →</strong> para navegar
          </div>
          <div className="d-flex gap-2 w-100 w-sm-auto">
            <button className="btn btn-outline-secondary flex-fill flex-sm-unset" onClick={() => alert("Guardado local (demo)")}>
              Guardar (demo)
            </button>
            {!finalizado ? (
              <button className="btn btn-success flex-fill flex-sm-unset" onClick={handleFinalizar}>
                Enviar respuestas (demo)
              </button>
            ) : (
              <button className="btn btn-primary flex-fill flex-sm-unset" onClick={() => navigate(0)}>
                Resolver de nuevo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
