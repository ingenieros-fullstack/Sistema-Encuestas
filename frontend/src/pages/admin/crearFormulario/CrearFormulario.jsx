import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import PasoInformacion from "./PasoInformacion";
import PasoConfiguracion from "./PasoConfiguracion";
import PreviewAside from "./PreviewAside";
import "../../../NuevoFormulario.css";

export default function CrearFormulario() {
  const API_URL = import.meta.env.VITE_API_URL || "https://corehr.mx/encuestas";
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "Encuesta",
    fecha_inicio: "",
    fecha_fin: "",
    introduccion: "",
    texto_final: "",
    umbral_aprobacion: "70",
    tiempo_limite: "0",
    navegacion_preguntas: false,
    mostrar_respuestas: false,
  });

  const [step, setStep] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [generalErrors, setGeneralErrors] = useState({});
  const rol = localStorage.getItem("rol") || "admin";
  const navigate = useNavigate();

  // ✅ Saber si el tipo actual es Encuesta
  const isEncuesta = formData.tipo === "Encuesta";

  // ==============================
  // 🧩 Manejo de cambios en inputs
  // ==============================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "mostrar_respuestas" && isEncuesta) return; // Bloquear toggle en encuestas

    const next = { ...formData, [name]: type === "checkbox" ? checked : value };
    setFormData(next);
    if (step === 1) setGeneralErrors(validateGeneral(next));
  };

  // ==============================
  // ✅ Validación del paso 1
  // ==============================
  const validateGeneral = (data) => {
    const errs = {};
    if (!data.titulo?.trim()) errs.titulo = "El título es obligatorio.";
    if (data.fecha_inicio && data.fecha_fin && data.fecha_fin < data.fecha_inicio)
      errs.fecha = "La fecha de fin no puede ser anterior al inicio.";
    return errs;
  };

  const isGeneralValid = useMemo(
    () => Object.keys(validateGeneral(formData)).length === 0,
    [formData]
  );

  // ==============================
  // 💾 Enviar formulario al backend
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 2) return;
    setLoading(true);
    setMensaje("");

    try {
      const token = localStorage.getItem("token");
      const payload =
        formData.tipo === "Encuesta"
          ? { ...formData, mostrar_respuestas: false }
          : formData;

      const res = await fetch(`${API_URL}/admin/formularios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje("Formulario creado exitosamente");
        setTimeout(() => navigate("/admin/formularios"), 1200);
      } else {
        setMensaje(data.message || "Error al crear formulario");
      }
    } catch (err) {
      console.error("❌ Error al crear formulario:", err);
      setMensaje("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 👁️ Vista previa lateral
  // ==============================
  const preview = useMemo(() => {
    const rango =
      formData.fecha_inicio && formData.fecha_fin
        ? `${formData.fecha_inicio} → ${formData.fecha_fin}`
        : "Sin rango definido";

    return {
      titulo: formData.titulo || "Nuevo formulario",
      tipo: formData.tipo,
      descripcion: formData.descripcion || "Agrega una descripción breve…",
      rango,
    };
  }, [formData]);

  // ==============================
  // 🧱 Render principal
  // ==============================
  return (
    <div className="min-vh-100 d-flex flex-column bg-body-tertiary">
      {/* NAVBAR */}
      <Navbar rol="admin" nombre={localStorage.getItem("nombre") || "Admin"} />

      {/* HERO / STEPPER */}
      <header className="page-hero container-xxl">
        <div className="page-hero__surface page-hero--accent">
          <div className="d-flex align-items-center gap-3">
            <span className="hero-icon bi bi-clipboard2-check"></span>
            <div>
              <h1 className="h3 mb-1">Crear Nuevo Formulario</h1>
              <p className="mb-0 text-body-secondary">
                Diseña encuestas y cuestionarios con controles claros y una vista previa.
              </p>
            </div>
          </div>

          <div className="chips">
            <button
              type="button"
              className={`chip ${step === 1 ? "active" : ""}`}
              onClick={() => setStep(1)}
            >
              <i className="bi bi-info-circle"></i> Información
            </button>

            <button
              type="button"
              className={`chip ${step === 2 ? "active" : ""} ${
                !isGeneralValid ? "disabled" : ""
              }`}
              onClick={() => isGeneralValid && setStep(2)}
              title={
                !isGeneralValid
                  ? "Completa la información general para continuar"
                  : "Ir a configuración"
              }
            >
              <i className="bi bi-sliders"></i> Configuración
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow-1 container-xxl py-4">
        <form onSubmit={handleSubmit} className="row g-4">
          {/* 🧩 Columna principal */}
          <div className="col-12 col-lg-8">
            {step === 1 ? (
              <PasoInformacion
                rol={rol}
                navigate={navigate}
                formData={formData}
                handleInputChange={handleInputChange}
                generalErrors={generalErrors}
                isGeneralValid={isGeneralValid}
                goNext={() => setStep(2)}
              />
            ) : (
              <PasoConfiguracion
                rol={rol}
                navigate={navigate}
                formData={formData}
                handleInputChange={handleInputChange}
                goBack={() => setStep(1)}
                mensaje={mensaje}
                loading={loading}
              />
            )}
          </div>

          {/* 🧩 Columna lateral (vista previa) */}
          <PreviewAside preview={preview} />
        </form>
      </main>
    </div>
  );
}
