import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function GestionSecciones() {
  const { codigo } = useParams();
  const [encuesta, setEncuesta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nuevaSeccion, setNuevaSeccion] = useState({
    nombre_seccion: "",
    tema: "",
  });

  const [nuevaPregunta, setNuevaPregunta] = useState({
    enunciado: "",
    tipo_pregunta: "respuesta_corta",
    obligatoria: false,
  });

  // ⚠️ Texto de opciones (solo para opcion_multiple / seleccion_unica)
  const [opcionesTexto, setOpcionesTexto] = useState("");

  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);
  const token = localStorage.getItem("token");

  // 📌 Obtener secciones + preguntas
  const obtenerDatos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/encuestas/${codigo}/secciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al cargar secciones");

      const data = await res.json();
      // data = array de secciones con alias Preguntas
      setEncuesta({ codigo, secciones: data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, [codigo]);

  // 📌 Crear sección
  const crearSeccion = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/encuestas/${codigo}/secciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaSeccion),
      });

      if (res.ok) {
        setNuevaSeccion({ nombre_seccion: "", tema: "" });
        obtenerDatos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 📌 Crear pregunta
  const crearPregunta = async () => {
    if (!seccionSeleccionada) return alert("Selecciona una sección primero");
    try {
      // preparar arreglo de opciones (si aplica)
      let opciones = [];
      if (
        nuevaPregunta.tipo_pregunta === "opcion_multiple" ||
        nuevaPregunta.tipo_pregunta === "seleccion_unica"
      ) {
        opciones = opcionesTexto
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }

      const payload = {
        ...nuevaPregunta,
        ...(opciones.length > 0 ? { opciones } : {}), // ← se enviará cuando existan
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

      if (res.ok) {
        setNuevaPregunta({
          enunciado: "",
          tipo_pregunta: "respuesta_corta",
          obligatoria: false,
        });
        setOpcionesTexto("");
        setSeccionSeleccionada(null);
        obtenerDatos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-6">⏳ Cargando secciones...</p>;
  if (error) return <p className="p-6 text-red-600">❌ {error}</p>;

  const requiereOpciones =
    nuevaPregunta.tipo_pregunta === "opcion_multiple" ||
    nuevaPregunta.tipo_pregunta === "seleccion_unica";

  return (
    <div className="min-vh-100 bg-gray-50">
      <Navbar rol="admin" nombre={localStorage.getItem("nombre") || "Admin"} />

      <div className="container p-6">
        <h1 className="text-2xl font-bold mb-6">Gestionar Secciones y Preguntas</h1>

        {/* Crear sección */}
        <div className="mb-8 border p-4 rounded bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-4">➕ Nueva Sección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Nombre de la sección"
              className="border p-2 w-full"
              value={nuevaSeccion.nombre_seccion}
              onChange={(e) =>
                setNuevaSeccion({
                  ...nuevaSeccion,
                  nombre_seccion: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Tema"
              className="border p-2 w-full"
              value={nuevaSeccion.tema}
              onChange={(e) =>
                setNuevaSeccion({ ...nuevaSeccion, tema: e.target.value })
              }
            />
          </div>
          <button
            onClick={crearSeccion}
            className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Crear Sección
          </button>
        </div>

        {/* Crear pregunta */}
        <div className="mb-8 border p-4 rounded bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-4">➕ Nueva Pregunta</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <select
              className="border p-2 w-full"
              value={seccionSeleccionada || ""}
              onChange={(e) => setSeccionSeleccionada(e.target.value)}
            >
              <option value="">Selecciona una sección...</option>
              {encuesta.secciones?.map((s) => (
                <option key={s.id_seccion} value={s.id_seccion}>
                  {s.nombre_seccion}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Enunciado de la pregunta"
              className="border p-2 w-full"
              value={nuevaPregunta.enunciado}
              onChange={(e) =>
                setNuevaPregunta({
                  ...nuevaPregunta,
                  enunciado: e.target.value,
                })
              }
            />

            <select
              className="border p-2 w-full"
              value={nuevaPregunta.tipo_pregunta}
              onChange={(e) =>
                setNuevaPregunta({
                  ...nuevaPregunta,
                  tipo_pregunta: e.target.value,
                })
              }
            >
              <option value="respuesta_corta">Respuesta corta</option>
              <option value="opcion_multiple">Opción múltiple</option>
              <option value="seleccion_unica">Selección única</option>
              <option value="si_no">Sí / No</option>
              <option value="escala_1_5">Escala 1-5</option>
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={nuevaPregunta.obligatoria}
                onChange={(e) =>
                  setNuevaPregunta({
                    ...nuevaPregunta,
                    obligatoria: e.target.checked,
                  })
                }
              />
              Obligatoria
            </label>
          </div>

          {/* Campo dinámico para opciones */}
          {requiereOpciones && (
            <div className="mt-3">
              <label className="block mb-1 text-sm text-gray-600">
                Opciones (una por línea o separadas por coma)
              </label>
              <textarea
                className="border p-2 w-full"
                rows={3}
                placeholder={"Ej:\nMuy satisfecho\nSatisfecho\nNeutral\nInsatisfecho\nMuy insatisfecho"}
                value={opcionesTexto}
                onChange={(e) => setOpcionesTexto(e.target.value)}
              />
            </div>
          )}

          <button
            onClick={crearPregunta}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
          >
            Crear Pregunta
          </button>
        </div>

        {/* Listar secciones y preguntas */}
        <div className="space-y-6">
          {encuesta.secciones?.map((seccion) => (
            <div
              key={seccion.id_seccion}
              className="border p-4 rounded bg-white shadow-sm"
            >
              <h2 className="text-lg font-bold">{seccion.nombre_seccion}</h2>
              <p className="text-gray-600">{seccion.tema}</p>

              {seccion.Preguntas && seccion.Preguntas.length > 0 ? (
                <ul className="mt-2 list-disc pl-6">
                  {seccion.Preguntas.map((pregunta) => (
                    <li key={pregunta.id_pregunta} className="mb-1">
                      <span className="font-medium">{pregunta.enunciado}</span>{" "}
                      <span className="text-sm text-gray-500">
                        ({pregunta.tipo_pregunta}
                        {pregunta.obligatoria ? ", obligatoria" : ""})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ml-1 mt-2 text-gray-500 italic">Sin preguntas aún</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
