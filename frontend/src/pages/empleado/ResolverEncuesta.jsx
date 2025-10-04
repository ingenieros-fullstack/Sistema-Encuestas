import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ResolverEncuestaEmpleado() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [encuesta, setEncuesta] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);
  const [indiceSeccion, setIndiceSeccion] = useState(0); // 🆕 control de secciones paso a paso

  const rol = localStorage.getItem("rol") || "empleado";
  const nombre = localStorage.getItem("nombre") || "Empleado";

  // Fetch encuesta
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

  const setValor = (id_pregunta, valor) =>
    setRespuestas((prev) => ({ ...prev, [id_pregunta]: valor }));

  const enviar = (finalizar) => {
    const lista = [];
    encuesta.Secciones.forEach((sec) =>
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
        if (finalizar) navigate("/empleado/dashboard");
        else alert("Avance guardado ✅");
      })
      .catch((err) => console.error("Error enviando respuestas:", err));
  };

  if (loading) return <p className="p-4">Cargando encuesta...</p>;
  if (!encuesta) return <p className="p-4">Encuesta no encontrada.</p>;

  // 🧩 Filtrar secciones visibles por condiciones
  const seccionesVisibles = encuesta.Secciones.filter(
    (sec) =>
      !sec.condicion_pregunta_id ||
      respuestas[sec.condicion_pregunta_id] === sec.condicion_valor
  );

  const seccionActual = seccionesVisibles[indiceSeccion];

  const avanzar = () => {
    if (indiceSeccion < seccionesVisibles.length - 1)
      setIndiceSeccion((i) => i + 1);
  };
  const retroceder = () => {
    if (indiceSeccion > 0) setIndiceSeccion((i) => i - 1);
  };

  return (
    <div>
      <Navbar rol={rol} nombre={nombre} />

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-700 mb-4">
          {encuesta.titulo}
        </h1>

        {/* Sección actual */}
        {seccionActual ? (
          <div className="mb-6 border-b pb-4">
            <h2 className="text-lg font-semibold mb-3">
              {seccionActual.nombre_seccion}
            </h2>
            {seccionActual.Preguntas.map((p) => (
              <PreguntaInput
                key={p.id_pregunta}
                pregunta={p}
                valor={respuestas[p.id_pregunta]}
                setValor={setValor}
              />
            ))}
          </div>
        ) : (
          <p>No hay más secciones disponibles.</p>
        )}

        {/* Navegación de secciones */}
        <div className="flex justify-between mt-4">
          <button
            disabled={indiceSeccion === 0}
            onClick={retroceder}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ← Anterior
          </button>

          {indiceSeccion < seccionesVisibles.length - 1 ? (
            <button
              onClick={avanzar}
              className="px-4 py-2 bg-indigo-500 text-white rounded"
            >
              Siguiente →
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => enviar(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Guardar avance
              </button>
              <button
                onClick={() => enviar(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Enviar encuesta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 🔹 Render dinámico de preguntas (con condicional incluida)
function PreguntaInput({ pregunta, valor, setValor }) {
  switch (pregunta.tipo_pregunta) {
    case "respuesta_corta":
      return (
        <div className="mb-3">
          <label>{pregunta.enunciado}</label>
          <input
            type="text"
            value={valor || ""}
            onChange={(e) => setValor(pregunta.id_pregunta, e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>
      );

    case "opcion_multiple":
      return (
        <div className="mb-3">
          <label>{pregunta.enunciado}</label>
          {pregunta.Opciones.map((opt) => (
            <div key={opt.id_opcion}>
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
      );

    case "seleccion_unica":
      return (
        <div className="mb-3">
          <label>{pregunta.enunciado}</label>
          {pregunta.Opciones.map((opt) => (
            <div key={opt.id_opcion}>
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
      );

    case "si_no":
    case "condicional": // 🆕 se comporta igual que si_no
      return (
        <div className="mb-3">
          <label>{pregunta.enunciado}</label>
          <div>
            <label className="mr-4">
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
          <label>{pregunta.enunciado}</label>
          <div className="flex gap-2">
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
  }
}
