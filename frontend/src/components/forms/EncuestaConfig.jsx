import { useCallback } from "react";

export default function EncuestaConfig({ formData, handleInputChange }) {
  // Sincroniza slider ↔ input numérico
  const setField = useCallback(
    (name, value) => handleInputChange({ target: { name, value, type: "text" } }),
    [handleInputChange]
  );

  const tiempo = String(formData.tiempo_limite ?? "0");

  return (
    // Para Encuesta mantenemos el layout estándar (preferencias a ancho completo)
    <div className="settings-grid">
      {/* Mensajes */}
      <div className="setting-card">
        <div className="setting-card__title">
          <i className="bi bi-chat-left-text"></i> Mensajes
        </div>

        <div className="field-grid">
          <div className="form-floating">
            <textarea
              id="introEncuesta"
              className="form-control"
              name="introduccion"
              value={formData.introduccion}
              onChange={handleInputChange}
              placeholder="Introducción"
              style={{ minHeight: 130 }}
            />
            <label htmlFor="introEncuesta">Introducción</label>
            <div className="form-text">Se muestra antes de iniciar la encuesta.</div>
          </div>

          <div className="form-floating">
            <textarea
              id="finalEncuesta"
              className="form-control"
              name="texto_final"
              value={formData.texto_final}
              onChange={handleInputChange}
              placeholder="Texto final"
              style={{ minHeight: 130 }}
            />
            <label htmlFor="finalEncuesta">Texto Final</label>
            <div className="form-text">Mensaje de cierre al completar el formulario.</div>
          </div>
        </div>
      </div>

      {/* Parámetros (solo tiempo límite, con valor CENTRADO bajo el slider) */}
      <div className="setting-card">
        <div className="setting-card__title">
          <i className="bi bi-speedometer2"></i> Parámetros
        </div>

        <div className="param-grid">
          <div>
            <div className="form-label fw-semibold">Tiempo Límite (minutos)</div>
            <div className="param-card param-card--stack">
              <input
                type="range"
                min="0"
                max="180"
                step="5"
                value={Number(tiempo)}
                onChange={(e) => setField("tiempo_limite", String(e.target.value))}
                className="form-range"
                aria-label="Tiempo límite (min)"
              />
              {/* readout centrado */}
              <div className="input-group input-unit readout-center">
                <input
                  type="number"
                  min="0"
                  max="180"
                  step="1"
                  name="tiempo_limite"
                  value={tiempo}
                  onChange={handleInputChange}
                  className="form-control text-center"
                  placeholder="0"
                />
                <span className="input-group-text">min</span>
              </div>
            </div>
            <div className="form-text">Usa 0 si no deseas límite de tiempo.</div>
          </div>
        </div>
      </div>

      {/* Preferencias */}
      <div className="setting-card">
        <div className="setting-card__title">
          <i className="bi bi-sliders2"></i> Preferencias
        </div>

        <ul className="option-list">
          <li className="option-row">
            <div className="option-icon"><i className="bi bi-arrow-left-right"></i></div>
            <div className="option-body">
              <div className="option-title">Permitir navegación entre preguntas</div>
              <div className="option-desc">Habilita ir atrás/adelante durante la encuesta.</div>
            </div>
            <div className="option-action">
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="navPreguntas"
                  name="navegacion_preguntas"
                  checked={!!formData.navegacion_preguntas}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </li>

          <li className="option-row">
            <div className="option-icon"><i className="bi bi-eye"></i></div>
            <div className="option-body">
              <div className="option-title">Mostrar respuestas al finalizar</div>
              <div className="option-desc">Muestra un resumen de respuestas al completar.</div>
            </div>
            <div className="option-action">
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="mostrarResp"
                  name="mostrar_respuestas"
                  checked={!!formData.mostrar_respuestas}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
