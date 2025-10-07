import EncuestaConfig from "../../../components/forms/EncuestaConfig";
import CuestionarioConfig from "../../../components/forms/CuestionarioConfig";

export default function PasoConfiguracion({
  rol,
  navigate,
  formData,
  handleInputChange,
  goBack,
  mensaje,
  loading,
}) {
  return (
    <section className="section-card section--accent">
      <div className="section-card__header">
        <i className="bi bi-sliders"></i>
        <h2 className="h5 mb-0">Configuración de {formData.tipo}</h2>
      </div>

      {formData.tipo === "Encuesta" ? (
        <EncuestaConfig
          formData={formData}
          handleInputChange={handleInputChange}
          disableMostrarRespuestas={true}
        />
      ) : (
        <CuestionarioConfig
          formData={formData}
          handleInputChange={handleInputChange}
          disableMostrarRespuestas={false}
        />
      )}

      <div className="actionbar actionbar--gradient">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="d-none d-sm-flex align-items-center gap-2 text-body-secondary">
            <i className="bi bi-shield-check"></i>
            <small>Revisa los parámetros y guarda cuando estés listo.</small>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-ghost-secondary" onClick={goBack}>
              <i className="bi bi-arrow-left-short"></i> Atrás
            </button>
            <button
              type="button"
              className="btn btn-ghost-secondary"
              onClick={() => navigate(`/${rol}/dashboard`)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary px-4" disabled={loading}>
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Creando…
                </>
              ) : (
                <>
                  <i className="bi bi-save2 me-2"></i> Crear Formulario
                </>
              )}
            </button>
          </div>
        </div>

        {mensaje && (
          <div
            className={`alert mt-3 mb-0 ${
              mensaje.includes("exitosamente") ? "alert-success" : "alert-danger"
            }`}
          >
            {mensaje}
          </div>
        )}
      </div>
    </section>
  );
}
