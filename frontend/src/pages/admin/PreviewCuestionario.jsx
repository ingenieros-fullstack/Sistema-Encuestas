import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Seccion from "../../components/cuestionario/Seccion";
import MensajeFinal from "../../components/cuestionario/MensajeFinal";
import "../../css/PreviewCuestionario.css";
import { QRCodeCanvas } from "qrcode.react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PreviewCuestionario() {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const [cuestionario, setCuestionario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mostrarIntro, setMostrarIntro] = useState(true);
  const [finalizado, setFinalizado] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);

  const qrRef = useRef(null);

  // -------- Carga --------
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    fetch(`${API_URL}/admin/cuestionarios/${codigo}/preview`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar la vista previa.");
        return res.json();
      })
      .then((data) => mounted && setCuestionario(data))
      .catch((e) => mounted && setError(e.message || "Error inesperado."))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [codigo]);

  const totalSecciones = cuestionario?.Secciones?.length || 0;
  const tiempoTxt = useMemo(
    () => (cuestionario?.tiempo_limite ? `${cuestionario.tiempo_limite} min` : "Sin límite"),
    [cuestionario]
  );

  // -------- Utilidades --------
  const descargarQR = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR-${codigo}.png`;
    a.click();
  };

  // -------- Loading / Error --------
  if (loading) {
    return (
      <div className="preview-shell d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" aria-label="Cargando" />
          <div className="text-secondary">Cargando cuestionario…</div>
        </div>
      </div>
    );
  }

  if (error || !cuestionario) {
    return (
      <div className="preview-shell d-flex align-items-center justify-content-center">
        <div className="glass-subtle p-4">
          <div className="text-danger fw-semibold mb-2">{error || "No se encontró el cuestionario."}</div>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Volver</button>
        </div>
      </div>
    );
  }

  // =================== INTRO (Hero oscuro) ===================
  if (mostrarIntro) {
    return (
      <div className="preview-shell">
        <div className="container position-relative">
          <button className="link-back" onClick={() => navigate(-1)}>
            ← Volver
          </button>

          {/* Bloque hero con fondo oscuro + texto blanco forzado por clases .preview-hero */}
          <section className="cover cover--deep glass shadow-lg preview-hero">
            <div className="cover-badges">
              <span className="metric-chip">⏱️ {tiempoTxt}</span>
              <span className="metric-chip">
                🎯{" "}
                <strong>
                  {cuestionario.umbral_aprobacion != null
                    ? `${cuestionario.umbral_aprobacion} pts`
                    : "—"}
                </strong>
              </span>
              <span className="metric-chip">📚 {totalSecciones} secciones</span>
              <span className="metric-chip"># {codigo}</span>
            </div>

            <h1 className="display-6 fw-semibold mb-2 text-white-imp text-center">
              {cuestionario.titulo}
            </h1>
            <p className="lead text-white-imp text-center mb-4">
              {cuestionario.introduccion || "Revisa y prueba antes de publicar."}
            </p>

            <div className="d-flex flex-wrap justify-content-center gap-2">
              <button
                className="btn btn-gradient btn-lg px-4 btn-primary-imp"
                onClick={() => setMostrarIntro(false)}
              >
                Comenzar
              </button>

              <button
                className="btn btn-outline-light-imp btn-lg"
                onClick={() => setMostrarQR(true)}
                aria-label="Ver QR"
              >
                Ver QR
              </button>

              <button className="btn btn-outline-light-imp btn-lg" onClick={() => navigate(-1)}>
                Cancelar
              </button>
            </div>
          </section>

          {/* Tarjetas de detalle (glass suave) */}
          <div className="row g-3 mt-4">
            <div className="col-12 col-md-4">
              <div className="detail-card glass-subtle">
                <div className="detail-ico">⏳</div>
                <div className="detail-title">Tiempo</div>
                <div className="detail-sub">{tiempoTxt}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="detail-card glass-subtle">
                <div className="detail-ico">🎯</div>
                <div className="detail-title">Umbral</div>
                <div className="detail-sub">
                  {cuestionario.umbral_aprobacion != null
                    ? `${cuestionario.umbral_aprobacion} puntos`
                    : "No definido"}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="detail-card glass-subtle">
                <div className="detail-ico">🗂️</div>
                <div className="detail-title">Secciones</div>
                <div className="detail-sub">{totalSecciones}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal QR */}
        {mostrarQR && (
          <>
            <div className="modal fade show d-block" tabIndex="-1" aria-modal="true">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                  <div className="modal-header">
                    <h5 className="modal-title">Abrir desde otro dispositivo</h5>
                    <button className="btn-close" onClick={() => setMostrarQR(false)} />
                  </div>
                  <div className="modal-body text-center">
                    <p className="text-secondary">
                      Escanea para abrir:
                      <br />
                      <span className="small">
                        {window.location.origin}/resolver/{codigo}
                      </span>
                    </p>
                    <div className="qr-frame">
                      <QRCodeCanvas
                        value={`${window.location.origin}/resolver/${codigo}`}
                        size={220}
                        ref={qrRef}
                      />
                    </div>
                  </div>
                  <div className="modal-footer d-flex justify-content-between">
                    <button className="btn btn-outline-secondary" onClick={() => setMostrarQR(false)}>
                      Cerrar
                    </button>
                    <button className="btn btn-primary" onClick={descargarQR}>
                      Descargar PNG
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop show"></div>
          </>
        )}
      </div>
    );
  }

  // =================== MENSAJE FINAL (preview) ===================
  if (finalizado) {
    // Para preview solo mostramos el mensaje final estetizado
    const puntajeTotal = (cuestionario.Secciones || [])
      .flatMap((s) => s.Preguntas || [])
      .reduce((acc, p) => acc + (p.puntaje || 0), 0);
    const aprobado = puntajeTotal >= (cuestionario.umbral_aprobacion || 0);

    return (
      <div className="preview-shell">
        <div className="container py-4">
          {/* Toolbar */}
          <div className="sticky-toolbar toolbar glass-subtle shadow-sm">
            <div className="toolbar-left">
              <button className="btn btn-ghost btn-square" onClick={() => navigate(-1)} aria-label="Volver">
                ←
              </button>
              <div className="toolbar-title">
                <div className="title-main text-truncate">{cuestionario.titulo}</div>
                <div className="meta-chips">
                  <span className="metric-chip">Vista previa</span>
                </div>
              </div>
            </div>
            <div className="toolbar-center">
              <div className="progress progress-slim" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress-bar progress-bar-gradient" style={{ width: "100%" }}>
                  Vista previa
                </div>
              </div>
            </div>
            <div className="toolbar-right">
            
              <button className="btn btn-gradient" onClick={() => navigate(`/resolver/${codigo}`)}>
                Resolver
              </button>
            </div>
          </div>

          <div className="celebrate card border-0 shadow-lg">
            <div className="card-body p-4 p-md-5">
              <MensajeFinal
                texto={cuestionario.texto_final || "Has terminado la vista previa del cuestionario."}
                aprobado={aprobado}
                puntajeTotal={puntajeTotal}
                umbral={cuestionario.umbral_aprobacion}
              />
              <div className="d-flex flex-wrap gap-2 mt-4">
                <button className="btn btn-primary" onClick={() => navigate(`/resolver/${codigo}`)}>
                  🚀 Resolver cuestionario
                </button>
                <button className="btn btn-outline-secondary" onClick={() => setMostrarIntro(true)}>
                  Volver a la portada
                </button>
                <button className="btn btn-outline-success" onClick={() => setMostrarQR(true)}>
                  Ver QR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal QR */}
        {mostrarQR && (
          <>
            <div className="modal fade show d-block" tabIndex="-1" aria-modal="true">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                  <div className="modal-header">
                    <h5 className="modal-title">Abrir desde otro dispositivo</h5>
                    <button className="btn-close" onClick={() => setMostrarQR(false)} />
                  </div>
                  <div className="modal-body text-center">
                    <div className="qr-frame">
                      <QRCodeCanvas value={`${window.location.origin}/resolver/${codigo}`} size={220} ref={qrRef} />
                    </div>
                    <p className="small text-muted mt-3 mb-0">
                      {window.location.origin}/resolver/{codigo}
                    </p>
                  </div>
                  <div className="modal-footer d-flex justify-content-between">
                    <button className="btn btn-outline-secondary" onClick={() => setMostrarQR(false)}>
                      Cerrar
                    </button>
                    <button className="btn btn-primary" onClick={descargarQR}>
                      Descargar PNG
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop show"></div>
          </>
        )}
      </div>
    );
  }

  // =================== SECCIONES (PREVIEW) ===================
  return (
    <div className="preview-shell">
      <div className="container py-4 content-light">
        {/* Toolbar */}
        <div className="sticky-toolbar toolbar glass-subtle shadow-sm">
          <div className="toolbar-left">
            <button className="btn btn-ghost btn-square" onClick={() => navigate(-1)} aria-label="Volver">
              ←
            </button>
            <div className="toolbar-title">
              <div className="title-main text-truncate">{cuestionario.titulo}</div>
              <div className="meta-chips">
                <span className="metric-chip">⏱️ {tiempoTxt}</span>
                <span className="metric-chip">📚 {totalSecciones} secciones</span>
                {cuestionario.umbral_aprobacion != null && (
                  <span className="metric-chip">🎯 {cuestionario.umbral_aprobacion} pts</span>
                )}
              </div>
            </div>
          </div>

          <div className="toolbar-center">
            <div
              className="progress progress-slim"
              role="progressbar"
              aria-label="Progreso de la vista previa"
              aria-valuenow={100}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="progress-bar progress-bar-gradient" style={{ width: "100%" }}>
                Vista previa
              </div>
            </div>
          </div>

          <div className="toolbar-right">
            <button
  type="button"
  className="btn btn-gradient"
  onClick={() => navigate(-1)}   // o navigate("/admin/formularios") si prefieres ruta fija
>
  Terminar vista previa
</button>

          </div>
        </div>

        {/* Hoja blanca (paper) con secciones y preguntas */}
        <div className="paper mt-3">
          {cuestionario.Secciones?.map((seccion, idx) => (
            <div className="card section-card shadow-sm border-0 mb-4" key={seccion.id_seccion}>
              <div className="card-body p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h6 mb-0">
                    <span className="section-pill">{idx + 1}</span> Sección {idx + 1} / {totalSecciones}
                  </h2>
                  <span className="badge text-bg-secondary">
                    {(seccion?.Preguntas || []).length} preguntas
                  </span>
                </div>

                {/* OJO: modo="preview" → muestra opciones (no interactivas) y la “Respuesta correcta” */}
                <Seccion seccion={seccion} modo="preview" />
              </div>
            </div>
          ))}

          {totalSecciones === 0 && (
            <div className="alert alert-warning">
              Este cuestionario aún no tiene secciones configuradas.
            </div>
          )}
        </div>
      </div>

      {/* Modal QR */}
      {mostrarQR && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title">Abrir desde otro dispositivo</h5>
                  <button className="btn-close" onClick={() => setMostrarQR(false)} />
                </div>
                <div className="modal-body text-center">
                  <div className="qr-frame">
                    <QRCodeCanvas value={`${window.location.origin}/resolver/${codigo}`} size={220} ref={qrRef} />
                  </div>
                  <p className="small text-muted mt-3 mb-0">
                    {window.location.origin}/resolver/{codigo}
                  </p>
                </div>
                <div className="modal-footer d-flex justify-content-between">
                  <button className="btn btn-outline-secondary" onClick={() => setMostrarQR(false)}>
                    Cerrar
                  </button>
                  <button className="btn btn-primary" onClick={descargarQR}>
                    Descargar PNG
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </div>
  );
}
