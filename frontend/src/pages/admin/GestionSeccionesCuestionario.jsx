// ... tus imports se mantienen igual
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const parseOptions = (txt) =>
  (txt || "").split(";").map((s) => s.trim()).filter(Boolean);
const joinOptions = (arr) =>
  (arr || []).map((s) => s.trim()).filter(Boolean).join(";");

function Chips({ items, onRemove }) {
  if (!items?.length) return null;
  return (
    <div className="d-flex flex-wrap gap-2 mt-2">
      {items.map((opt, i) => (
        <span key={i} className="badge rounded-pill text-bg-secondary">
          {opt}
          {onRemove && (
            <button
              type="button"
              className="btn btn-sm btn-link text-light ms-1 p-0"
              onClick={() => onRemove(i)}
              title="Quitar opción"
            >
              ✕
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

export default function GestionSeccionesCuestionario() {
  const { codigo } = useParams();
  const [data, setData] = useState(null);
  const [secNombre, setSecNombre] = useState("");
  const [newQ, setNewQ] = useState({
    id_seccion: "",
    enunciado: "",
    tipo_pregunta: "respuesta_corta",
    obligatoria: false,
    puntaje: 0,
    opciones: [],
    respuesta_correcta: "",
  });
  const [optInput, setOptInput] = useState("");
  const [editSeccion, setEditSeccion] = useState(null);
  const [editPregunta, setEditPregunta] = useState(null);
  const [optEditInput, setOptEditInput] = useState("");
  const token = useMemo(() => localStorage.getItem("token"), []);

  const fetchPreview = async () => {
    const res = await fetch(`${API}/admin/cuestionarios/${codigo}/preview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setData(await res.json());
  };
  useEffect(() => {
    fetchPreview();
  }, [codigo]);

  const crearSeccion = async () => {
    if (!secNombre.trim()) return alert("Ingrese nombre de la sección");
    const res = await fetch(`${API}/admin/cuestionarios/secciones`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codigo_formulario: codigo,
        nombre_seccion: secNombre,
      }),
    });
    if (res.ok) {
      setSecNombre("");
      fetchPreview();
    }
  };

  const crearPregunta = async () => {
    if (!newQ.id_seccion) return alert("Seleccione una sección");
    if (!newQ.enunciado.trim()) return alert("Ingrese enunciado");
    if (newQ.tipo_pregunta !== "escala_1_5" && !newQ.respuesta_correcta)
      return alert("Debe definir una respuesta correcta");

    const payload = {
      ...newQ,
      opciones: joinOptions(newQ.opciones),
      id_seccion: Number(newQ.id_seccion),
    };

    const res = await fetch(`${API}/admin/cuestionarios/preguntas`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      resetNuevaPregunta();
      fetchPreview();
    }
  };

  const resetNuevaPregunta = () => {
    setNewQ({
      id_seccion: "",
      enunciado: "",
      tipo_pregunta: "respuesta_corta",
      obligatoria: false,
      puntaje: 0,
      opciones: [],
      respuesta_correcta: "",
    });
    setOptInput("");
  };

  const eliminarSeccion = async (id) => {
    if (!confirm("¿Eliminar sección y sus preguntas?")) return;
    const res = await fetch(`${API}/admin/cuestionarios/secciones/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchPreview();
  };

  const eliminarPregunta = async (id) => {
    if (!confirm("¿Eliminar pregunta?")) return;
    const res = await fetch(`${API}/admin/cuestionarios/preguntas/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchPreview();
  };

  const guardarSeccionEditada = async () => {
    const res = await fetch(
      `${API}/admin/cuestionarios/secciones/${editSeccion.id_seccion}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre_seccion: editSeccion.nombre_seccion }),
      }
    );
    if (res.ok) {
      setEditSeccion(null);
      fetchPreview();
    }
  };

  const guardarPreguntaEditada = async () => {
    const payload = {
      ...editPregunta,
      opciones: joinOptions(editPregunta.opciones),
    };
    const res = await fetch(
      `${API}/admin/cuestionarios/preguntas/${editPregunta.id_pregunta}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    if (res.ok) {
      setEditPregunta(null);
      fetchPreview();
    }
  };

  if (!data) return <p className="p-6">Cargando cuestionario...</p>;

  const renderRespuestaAsignada = (p) => {
    if (!p.respuesta_correcta) return <span className="text-danger">–</span>;
    if (p.tipo_pregunta === "opcion_multiple") {
      return p.respuesta_correcta.split(";").map((r, i) => (
        <span key={i} className="badge text-bg-success me-1">
          {r}
        </span>
      ));
    }
    return <strong>{p.respuesta_correcta}</strong>;
  };

  const PreguntaForm = ({ q, setQ, optInput, setOptInput }) => {
  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setQ((prev) => ({ ...prev, [field]: value }));
  };

  const addOption = () => {
    if (!optInput.trim()) return;
    setQ((prev) => ({
      ...prev,
      opciones: [...prev.opciones, optInput.trim()],
    }));
    setOptInput("");
  };

  const removeOption = (i) => {
    setQ((prev) => ({
      ...prev,
      opciones: prev.opciones.filter((_, x) => x !== i),
    }));
  };

  return (
    <>
      {/* Selector de sección */}
      <select
        className="form-select mb-3 shadow-sm"
        value={q.id_seccion}
        onChange={handleChange("id_seccion")}
      >
        <option value="">-- Selecciona sección --</option>
        {data.Secciones?.map((s) => (
          <option key={s.id_seccion} value={s.id_seccion}>
            {s.nombre_seccion}
          </option>
        ))}
      </select>

      <input
        className="form-control mb-3 form-control-lg shadow-sm"
        placeholder="Enunciado"
        value={q.enunciado || ""}
        onChange={handleChange("enunciado")}
      />

      <div className="d-flex flex-wrap gap-2 mb-3">
        <select
          className="form-select shadow-sm"
          value={q.tipo_pregunta || "respuesta_corta"}
          onChange={(e) => {
            setQ((prev) => ({
              ...prev,
              tipo_pregunta: e.target.value,
              opciones: [],
              respuesta_correcta: "",
            }));
            setOptInput("");
          }}
        >
          <option value="respuesta_corta">Respuesta corta</option>
          <option value="si_no">Sí / No</option>
          <option value="seleccion_unica">Selección única</option>
          <option value="opcion_multiple">Opción múltiple</option>
          <option value="escala_1_5">Escala 1–5</option>
        </select>

        <input
          type="number"
          className="form-control shadow-sm"
          min="0"
          max="10"
          value={q.puntaje ?? 0}
          onChange={handleChange("puntaje")}
        />

        <div className="form-check d-flex align-items-center">
          <input
            type="checkbox"
            className="form-check-input me-2"
            checked={!!q.obligatoria}
            onChange={handleChange("obligatoria")}
          />
          Obligatoria
        </div>
      </div>

      {/* Tipo de respuesta */}
      {q.tipo_pregunta === "respuesta_corta" && (
        <input
          className="form-control shadow-sm"
          placeholder="Respuesta correcta"
          value={q.respuesta_correcta || ""}
          onChange={handleChange("respuesta_correcta")}
        />
      )}

      {q.tipo_pregunta === "si_no" && (
        <select
          className="form-select shadow-sm"
          value={q.respuesta_correcta || ""}
          onChange={handleChange("respuesta_correcta")}
        >
          <option value="">-- Selecciona --</option>
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </select>
      )}

      {(q.tipo_pregunta === "seleccion_unica" ||
        q.tipo_pregunta === "opcion_multiple") && (
        <>
          <div className="d-flex gap-2 mb-2">
            <input
              className="form-control shadow-sm"
              placeholder="Opción"
              value={optInput}
              onChange={(e) => setOptInput(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={addOption}>
              Agregar opción
            </button>
          </div>

          <Chips items={q.opciones} onRemove={removeOption} />

          <select
            className="form-select mt-2 shadow-sm"
            value={q.respuesta_correcta || ""}
            onChange={handleChange("respuesta_correcta")}
          >
            <option value="">-- Respuesta correcta --</option>
            {q.opciones.map((o, i) => (
              <option key={i} value={o}>
                {o}
              </option>
            ))}
          </select>
        </>
      )}

      {q.tipo_pregunta === "escala_1_5" && (
        <select
          className="form-select shadow-sm"
          value={q.respuesta_correcta || ""}
          onChange={handleChange("respuesta_correcta")}
        >
          <option value="">(opcional)</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      )}
    </>
  );
};


  return (
    <div className="min-vh-100 d-flex flex-column bg-body-tertiary">
      <Navbar rol="admin" nombre={localStorage.getItem("nombre") || "Admin"} />
      <main className="container-xxl py-4">
        <h1 className="display-5 fw-bold text-primary mb-3">
          Gestionar Secciones y Preguntas
        </h1>
        <h2 className="h5 text-muted mb-4">{data.titulo}</h2>

        {/* Nueva sección */}
        <div className="card shadow-sm p-4 mb-4 border-start border-4 border-primary bg-white">
          <h5 className="mb-3">➕ Nueva Sección</h5>
          <div className="d-flex gap-2">
            <input
              className="form-control form-control-lg shadow-sm"
              placeholder="Nombre de la sección"
              value={secNombre}
              onChange={(e) => setSecNombre(e.target.value)}
            />
            <button className="btn btn-primary" onClick={crearSeccion}>
              Crear Sección
            </button>
          </div>
        </div>

        {/* Nueva pregunta */}
        <div className="card shadow-sm p-4 mb-4 border-start border-4 border-success bg-white">
          <h5 className="mb-3">➕ Nueva Pregunta</h5>
          <PreguntaForm
            q={newQ}
            setQ={setNewQ}
            optInput={optInput}
            setOptInput={setOptInput}
          />
          <div className="text-end mt-3">
            <button className="btn btn-success" onClick={crearPregunta}>
              Crear Pregunta
            </button>
          </div>
        </div>

        {/* Secciones */}
        {data.Secciones?.map((s) => (
          <div
            key={s.id_seccion}
            className="card p-4 mb-4 shadow-sm bg-white border-start border-4 border-secondary"
          >
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{s.nombre_seccion}</h5>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-warning text-white"
                  onClick={() => setEditSeccion(s)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => eliminarSeccion(s.id_seccion)}
                >
                  Eliminar
                </button>
              </div>
            </div>
            <ul className="mt-3">
              {s.Preguntas?.map((p) => (
                <li
                  key={p.id_pregunta}
                  className="list-group-item bg-light rounded shadow-sm mb-3 border p-3"
                >
                  <div className="fw-semibold">{p.enunciado}</div>
                  <div className="small text-muted">
                    {p.tipo_pregunta} {p.obligatoria ? "(obligatoria)" : ""} ·
                    Puntaje: {p.puntaje}
                  </div>
                  <div className="text-success">
                    Respuesta asignada: {renderRespuestaAsignada(p)}
                  </div>
                  <div className="mt-2 d-flex gap-2">
                    <button
                      className="btn btn-warning text-white"
                      onClick={() =>
                        setEditPregunta({
                          ...p,
                          opciones: parseOptions(p.opciones || ""),
                          enunciado: p.enunciado || "",
                          tipo_pregunta: p.tipo_pregunta || "respuesta_corta",
                          puntaje: p.puntaje ?? 0,
                          obligatoria: !!p.obligatoria,
                          respuesta_correcta: p.respuesta_correcta || "",
                          id_seccion: p.id_seccion,
                        })
                      }
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => eliminarPregunta(p.id_pregunta)}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Modal editar sección */}
        {editSeccion && (
          <div className="modal d-block" tabIndex="-1" style={{ background: "#0003" }}>
            <div className="modal-dialog">
              <div className="modal-content p-4">
                <h5>Editar sección</h5>
                <input
                  className="form-control mb-3"
                  value={editSeccion.nombre_seccion}
                  onChange={(e) =>
                    setEditSeccion({
                      ...editSeccion,
                      nombre_seccion: e.target.value,
                    })
                  }
                />
                <div className="text-end">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={() => setEditSeccion(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={guardarSeccionEditada}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal editar pregunta */}
        {editPregunta && (
          <div className="modal d-block" tabIndex="-1" style={{ background: "#0003" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content p-4">
                <h5>Editar pregunta</h5>
                <PreguntaForm
                  q={editPregunta}
                  setQ={setEditPregunta}
                  optInput={optEditInput}
                  setOptInput={setOptEditInput}
                />
                <div className="text-end mt-3">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={() => setEditPregunta(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={guardarPreguntaEditada}
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
