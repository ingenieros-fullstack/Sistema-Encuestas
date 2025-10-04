import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import "../../../GestionSecciones.css";

// 🧩 Componentes divididos
import PanelSecciones from "./PanelSecciones";
import PanelPreguntasSeccion from "./PanelPreguntasSeccion";
import PanelPregunta from "./PanelPregunta";
import EditarSeccionModal from "./EditarSeccionModal";
import EditarPreguntaModal from "./EditarPreguntaModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function GestionSecciones() {
  const navigate = useNavigate();
  const { codigo } = useParams();
  const token = localStorage.getItem("token");

  // === Estados base ===
  const [encuesta, setEncuesta] = useState({ codigo, secciones: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // === Estados de UI ===
  const [buscarSec, setBuscarSec] = useState("");
  const [nuevaSeccion, setNuevaSeccion] = useState({
    nombre_seccion: "",
    tema: "",
    condicion_pregunta_id: "",
    condicion_valor: "si",
  });
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("");
  const [modalEditarSeccion, setModalEditarSeccion] = useState(null);
  const [modalEditarPregunta, setModalEditarPregunta] = useState(null);

  // === Preguntas ===
  const [nuevaPregunta, setNuevaPregunta] = useState({
    enunciado: "",
    tipo_pregunta: "respuesta_corta",
    obligatoria: false,
  });
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  const [opciones, setOpciones] = useState([]);
  const [mostrarPegadoMasivo, setMostrarPegadoMasivo] = useState(false);
  const [bloqueOpciones, setBloqueOpciones] = useState("");
  const [filtro, setFiltro] = useState("");

  const selectedSection = encuesta.secciones.find(
    (s) => String(s.id_seccion) === String(seccionSeleccionada)
  );

  // ==================== Fetch ====================
  const obtenerDatos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/encuestas/${codigo}/secciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar secciones");
      const data = await res.json();
      setEncuesta({ codigo, secciones: data || [] });
      if (!seccionSeleccionada && data?.length)
        setSeccionSeleccionada(String(data[0].id_seccion));
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, [codigo]);

  const totalSecciones = encuesta.secciones.length;
  const totalPreguntas = encuesta.secciones.reduce(
    (acc, s) => acc + (s.Preguntas?.length || 0),
    0
  );

  // ==================== SECCIONES ====================
  const crearSeccion = async () => {
    if (!nuevaSeccion.nombre_seccion.trim()) return;
    try {
      const res = await fetch(`${API_URL}/admin/encuestas/${codigo}/secciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaSeccion),
      });
      if (!res.ok) throw new Error("No se pudo crear la sección");
      setNuevaSeccion({
        nombre_seccion: "",
        tema: "",
        condicion_pregunta_id: "",
        condicion_valor: "si",
      });
      await obtenerDatos();
    } catch (e) {
      alert(e.message);
    }
  };

  const eliminarSeccion = async (id_seccion) => {
    const ok = confirm("¿Eliminar esta sección y sus preguntas?");
    if (!ok) return;
    try {
      const res = await fetch(`${API_URL}/admin/encuestas/secciones/${id_seccion}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo eliminar la sección");
      await obtenerDatos();
    } catch (e) {
      alert(e.message);
    }
  };

  const guardarEdicionSeccion = async () => {
    try {
      const res = await fetch(
        `${API_URL}/admin/encuestas/secciones/${modalEditarSeccion.id_seccion}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(modalEditarSeccion),
        }
      );
      if (!res.ok) throw new Error("Error al actualizar sección");
      setModalEditarSeccion(null);
      await obtenerDatos();
    } catch (e) {
      alert(e.message);
    }
  };

  // ==================== PREGUNTAS ====================
  const requiereOpciones =
    nuevaPregunta.tipo_pregunta === "opcion_multiple" ||
    nuevaPregunta.tipo_pregunta === "seleccion_unica";

  const puedeCrearPregunta = useMemo(() => {
    if (!seccionSeleccionada) return false;
    if (!nuevaPregunta.enunciado.trim()) return false;
    if (requiereOpciones && opciones.length < 2) return false;
    return true;
  }, [seccionSeleccionada, nuevaPregunta, requiereOpciones, opciones]);

  const crearPregunta = async () => {
    if (!puedeCrearPregunta) return;
    try {
      const payload = {
        ...nuevaPregunta,
        ...(requiereOpciones ? { opciones } : {}),
      };
      const res = await fetch(
        `${API_URL}/admin/encuestas/secciones/${seccionSeleccionada}/preguntas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("No se pudo crear la pregunta");
      setNuevaPregunta({
        enunciado: "",
        tipo_pregunta: "respuesta_corta",
        obligatoria: false,
      });
      setOpciones([]);
      await obtenerDatos();
    } catch (e) {
      alert(e.message);
    }
  };

  const eliminarPregunta = async (id_pregunta) => {
    const ok = confirm("¿Eliminar esta pregunta?");
    if (!ok) return;
    try {
      const res = await fetch(`${API_URL}/admin/encuestas/preguntas/${id_pregunta}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo eliminar la pregunta.");
      await obtenerDatos();
    } catch (e) {
      alert(e.message);
    }
  };

 const guardarEdicionPregunta = async (formData) => {
  try {
    const res = await fetch(
      `${API_URL}/admin/encuestas/preguntas/${modalEditarPregunta.id_pregunta}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );
    if (!res.ok) throw new Error("Error al actualizar pregunta");
    setModalEditarPregunta(null);
    await obtenerDatos();
  } catch (e) {
    alert(e.message);
  }
};


  // ==================== Opciones (chips) ====================
  const agregarOpcion = () => {
    const val = (nuevaOpcion || "").trim();
    if (!val) return;
    if (opciones.includes(val)) return;
    setOpciones([...opciones, val]);
    setNuevaOpcion("");
  };
  const eliminarOpcionChip = (i) =>
    setOpciones(opciones.filter((_, idx) => idx !== i));
  const pegarEnBloque = () => {
    const items = (bloqueOpciones || "")
      .split(/[\n,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!items.length) return;
    const nuevos = [...opciones];
    items.forEach((it) => {
      if (!nuevos.includes(it)) nuevos.push(it);
    });
    setOpciones(nuevos);
    setBloqueOpciones("");
    setMostrarPegadoMasivo(false);
  };

  // ==================== UI ====================
  if (loading) return <div className="gs2-loading">Cargando…</div>;
  if (error) return <div className="gs2-error">❌ {error}</div>;

  return (
    <div className="gs2-root">
      <Navbar rol="admin" nombre={localStorage.getItem("nombre") || "Admin"} />

      {/* ===== Toolbar ===== */}
      <div className="gs2-toolbar">
        <div className="gs2-toolbar-left">
          <button className="gs2-btn gs2-btn-ghost" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <div className="gs2-title">
            <span className="gs2-dot" /> Gestor de Secciones
          </div>
          <div className="gs2-code">Código: {codigo}</div>
        </div>

        <div className="gs2-kpis">
          <div className="gs2-kpi">
            <div className="kpi-label">Secciones</div>
            <div className="kpi-value">{totalSecciones}</div>
          </div>
          <div className="gs2-kpi">
            <div className="kpi-label">Preguntas</div>
            <div className="kpi-value">{totalPreguntas}</div>
          </div>
        </div>
      </div>

      {/* ===== Layout principal ===== */}
      <div className="gs2-content">
        <PanelSecciones
          secciones={encuesta.secciones}
          buscarSec={buscarSec}
          setBuscarSec={setBuscarSec}
          nuevaSeccion={nuevaSeccion}
          setNuevaSeccion={setNuevaSeccion}
          crearSeccion={crearSeccion}
          eliminarSeccion={eliminarSeccion}
          setModalEditarSeccion={setModalEditarSeccion}
          seccionSeleccionada={seccionSeleccionada}
          setSeccionSeleccionada={setSeccionSeleccionada}
        />

        <PanelPreguntasSeccion
          selectedSection={selectedSection}
          filtro={filtro}
          setFiltro={setFiltro}
          eliminarPregunta={eliminarPregunta}
          setModalEditarPregunta={setModalEditarPregunta}
        />

        <PanelPregunta
          nuevaPregunta={nuevaPregunta}
          setNuevaPregunta={setNuevaPregunta}
          nuevaOpcion={nuevaOpcion}
          setNuevaOpcion={setNuevaOpcion}
          opciones={opciones}
          agregarOpcion={agregarOpcion}
          eliminarOpcionChip={eliminarOpcionChip}
          mostrarPegadoMasivo={mostrarPegadoMasivo}
          setMostrarPegadoMasivo={setMostrarPegadoMasivo}
          bloqueOpciones={bloqueOpciones}
          setBloqueOpciones={setBloqueOpciones}
          pegarEnBloque={pegarEnBloque}
          crearPregunta={crearPregunta}
          puedeCrearPregunta={puedeCrearPregunta}
          requiereOpciones={requiereOpciones}
        />
      </div>

      {/* ===== Modales ===== */}
      <EditarSeccionModal
        modalEditarSeccion={modalEditarSeccion}
        setModalEditarSeccion={setModalEditarSeccion}
        guardarEdicionSeccion={guardarEdicionSeccion}
      />

      <EditarPreguntaModal
        modalEditarPregunta={modalEditarPregunta}
        setModalEditarPregunta={setModalEditarPregunta}
        guardarEdicionPregunta={guardarEdicionPregunta}
      />
    </div>
  );
}
