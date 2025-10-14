// src/pages/empleado/ResolverCuestionario.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
// Reutilizamos los estilos gf-* de la encuesta
import "../../css/ResolverEncuestaEmpleado.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ResolverCuestionario() {
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

  // ====== Fetch cuestionario (manejo de errores y completado)
  useEffect(() => {
    fetch(`${API_URL}/empleado/cuestionarios/${codigo}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 403) {
            const data = await res.json();
            if (data.completado) {
              alert("Este cuestionario ya fue completado");
              navigate("/empleado/dashboard");
              return Promise.reject();
            }
            throw new Error(data.error || "No tienes acceso a este cuestionario");
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
        if (err) {
          console.error("Error cargando cuestionario:", err);
          alert(err.message);
          navigate("/empleado/dashboard");
        }
      });
  }, [codigo, token, navigate]);

  // ====== Helpers (sin hooks nuevos luego de returns)
  const setValor = (id_pregunta, valor) =>
    setRespuestas((prev) => ({ ...prev, [id_pregunta]: valor }));

  // Secciones visibles por condición
  const seccionesVisibles = (cuestionario?.Secciones || []).filter(
    (sec) =>
      !sec.condicion_pregunta_id ||
      respuestas[sec.condicion_pregunta_id] === sec.condicion_valor
  );

  // Returns tempranos seguros
  if (loading) return <div className="gf-screen-center">Cargando cuestionario…</div>;
  if (!cuestionario) return <div className="gf-screen-center">No se pudo cargar el cuestionario.</div>;

  // ====== Pantalla de resultados
  if (resultado) {
    const puntajeMaximo = (cuestionario.Secciones || [])
      .flatMap((s) => s.Preguntas || [])
      .reduce((acc, p) => acc + (p.puntaje || 0), 0);

    const porcentaje = puntajeMaximo > 0 ? (resultado.puntajeTotal / puntajeMaximo) * 100 : 0;
    const umbral = cuestionario.umbral_aprobacion || 0;
    const aprobado = porcentaje >= umbral;

    return (
      <div className="gf-shell">
        <Navbar nombre={nombre} rol={rol} />
        <div className="gf-header" style={{ marginTop: 24 }}>
          <div className="gf-section-card">
            <div className="gf-section-head" style={{ textAlign: "center" }}>
              <h2 className="gf-section-title" style={{ marginBottom: 8 }}>{cuestionario.titulo}</h2>
              <div style={{ marginTop: 6 }}>
                <span
                  className="gf-result-badge"
                  data-state={aprobado ? "ok" : "ko"}
                >
                  {aprobado ? "✓ APROBADO" : "✗ NO APROBADO"}
                </span>
              </div>

              <div className="gf-result-grid">
                <div className="gf-result-box">
                  <div className="gf-result-label">Puntaje</div>
                  <div className="gf-result-value">
                    {resultado.puntajeTotal} / {puntajeMaximo}
                  </div>
                </div>
                <div className="gf-result-box">
                  <div className="gf-result-label">Porcentaje</div>
                  <div className="gf-result-value">{porcentaje.toFixed(1)}%</div>
                </div>
                <div className="gf-result-box">
                  <div className="gf-result-label">Umbral</div>
                  <div className="gf-result-value">{umbral}%</div>
                </div>
              </div>
            </div>

            {cuestionario.mostrar_respuestas && resultado.respuestasDetalle?.length > 0 && (
              <div className="gf-questions" style={{ paddingTop: 10 }}>
                <h3 className="gf-section-title" style={{ fontSize: 18, marginBottom: 8 }}>
                  Revisión de respuestas
                </h3>
                {resultado.respuestasDetalle.map((det, idx) => (
                  <div
                    key={idx}
                    className={`gf-review ${det.es_correcta ? "is-ok" : "is-ko"}`}
                  >
                    <p className="gf-review-q">{det.pregunta}</p>
                    <p className="gf-review-line">
                      <span className="gf-review-tag">Tu respuesta:</span> {det.respuesta}
                    </p>
                    {det.respuesta_correcta && (
                      <p className="gf-review-line">
                        <span className="gf-review-tag">Respuesta correcta:</span>{" "}
                        {det.respuesta_correcta}
                      </p>
                    )}
                    <p className={`gf-review-score ${det.es_correcta ? "ok" : "ko"}`}>
                      {det.es_correcta ? "✓ Correcta" : "✗ Incorrecta"} — {det.puntaje_obtenido} / {det.puntaje_total} pts
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="gf-nav" style={{ padding: 16 }}>
              <div className="gf-nav-right" style={{ marginLeft: "auto" }}>
                <button
                  className="gf-btn gf-btn-primary"
                  onClick={() => navigate("/empleado/dashboard")}
                >
                  Volver al panel
                </button>
              </div>
            </div>

            <div className="gf-review-info">
              ℹ️ Este cuestionario ha sido completado y guardado. No es posible volver a responderlo.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ====== Flujo normal (resolución)
  if (seccionesVisibles.length === 0) {
    return <div className="gf-screen-center">No hay secciones disponibles.</div>;
  }

  const seccionActual = seccionesVisibles[indiceSeccion];
  const esUltimaSeccion = indiceSeccion === seccionesVisibles.length - 1;

  const avanzarSeccion = () => {
    if (esUltimaSeccion) enviarRespuestas();
    else setIndiceSeccion((prev) => prev + 1);
  };
  const retrocederSeccion = () => {
    if (indiceSeccion > 0) setIndiceSeccion((prev) => prev - 1);
  };

  const enviarRespuestas = async () => {
    // Normaliza respuestas (igual que tu versión)
    const respuestasNormalizadas = Object.entries(respuestas).map(
      ([id_pregunta, valor]) => {
        let valorNormalizado = valor;
        if (typeof valor === "string") {
          valorNormalizado = valor.toLowerCase().trim();
        } else if (Array.isArray(valor)) {
          valorNormalizado = valor.map((v) => v.toLowerCase().trim()).sort().join(";");
        } else if (typeof valor === "number") {
          valorNormalizado = String(valor);
        }
        return { id_pregunta: parseInt(id_pregunta), respuesta: valorNormalizado };
      }
    );

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

  // Progreso simple (secciones)
  const pctSeccion = Math.round(((indiceSeccion + 1) / seccionesVisibles.length) * 100);

  return (
    <div className="gf-shell">
      <Navbar nombre={nombre} rol={rol} />

      {/* Header tipo Forms */}
      <header className="gf-header">
        <div className="gf-header-card">
          <h1 className="gf-title">{cuestionario.titulo}</h1>
          {cuestionario.descripcion ? (
            <p className="gf-subtitle">{cuestionario.descripcion}</p>
          ) : null}
          <div className="gf-progress">
            <div className="gf-progress-bar" style={{ width: `${pctSeccion}%` }} />
          </div>
          <span className="gf-progress-text">
            {indiceSeccion + 1} / {seccionesVisibles.length}
          </span>
        </div>
      </header>

      {/* Card de sección */}
      <main className="gf-main">
        <section className="gf-section-card">
          <div className="gf-section-head">
            <h2 className="gf-section-title">{seccionActual.nombre_seccion}</h2>
            {seccionActual.descripcion ? (
              <p className="gf-section-desc">{seccionActual.descripcion}</p>
            ) : null}
          </div>

          <div className="gf-questions">
            {(seccionActual.Preguntas || []).map((pregunta, idx) => (
              <PreguntaInput
                key={pregunta.id_pregunta}
                index={idx + 1}
                pregunta={pregunta}
                valor={respuestas[pregunta.id_pregunta]}
                setValor={setValor}
              />
            ))}
          </div>

          <div className="gf-nav" style={{ paddingTop: 4 }}>
            {cuestionario.navegacion_preguntas && indiceSeccion > 0 ? (
              <button className="gf-btn gf-btn-text" onClick={retrocederSeccion}>
                ← Anterior
              </button>
            ) : <span />}

            <div className="gf-nav-right">
              <button className="gf-btn gf-btn-primary" onClick={avanzarSeccion}>
                {esUltimaSeccion ? "Finalizar" : "Siguiente →"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ========= UI de pregunta estilo Forms ========= */
function PreguntaInput({ index, pregunta, valor, setValor }) {
  const opciones = pregunta.Opciones || [];

  const Etiqueta = () => (
    <div className="gf-q-label">
      <span className="gf-q-index">{index}</span>
      <span className="gf-q-text">{pregunta.enunciado}</span>
      {pregunta.puntaje ? (
        <span className="gf-q-score">({pregunta.puntaje} pts)</span>
      ) : null}
    </div>
  );

  switch (pregunta.tipo_pregunta) {
    case "respuesta_corta":
      return (
        <div className="gf-q">
          <Etiqueta />
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
          <Etiqueta />
          <div className="gf-options">
            {opciones.map((opt) => {
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
          <Etiqueta />
          <div className="gf-options">
            {opciones.map((opt) => (
              <label key={opt.id_opcion} className={`gf-opt ${valor === opt.texto ? "is-checked" : ""}`}>
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
      return (
        <div className="gf-q">
          <Etiqueta />
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
          <Etiqueta />
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
      return <div className="gf-q"><Etiqueta /><p className="gf-muted">Tipo no soportado</p></div>;
  }
}
