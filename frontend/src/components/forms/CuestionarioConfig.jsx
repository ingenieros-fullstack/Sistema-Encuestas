import { useCallback } from "react";

export default function CuestionarioConfig({ formData, handleInputChange }) {
  // Sincroniza slider ↔ input numérico
  const setField = useCallback(
    (name, value) => handleInputChange({ target: { name, value, type: "text" } }),
    [handleInputChange]
  );

  const tiempo = String(formData.tiempo_limite ?? "0");
  const umbral = String(formData.umbral_aprobacion ?? "70");

  return (
    <div className="config-grid">
      {/* Columna izquierda: Mensajes + Preferencias */}
      <div className="config-col">
        {/* Mensajes */}
        <div className="setting-card">
          <div className="setting-card__title">
            <i className="bi bi-card-text"></i> Mensajes
          </div>

          <div className="field-grid">
            <div className="form-floating">
              <textarea
                id="introCuestionario"
                className="form-control"
                name="introduccion"
                value={formData.introduccion}
                onChange={handleInputChange}
                placeholder="Introducción"
                style={{ minHeight: 130 }}
              />
              <label htmlFor="introCuestionario">Introducción</label>
              <div className="form-text">Incluye reglas y criterios de evaluación.</div>
            </div>

            <div className="form-floating">
              <textarea
                id="finalCuestionario"
                className="form-control"
                name="texto_final"
                value={formData.texto_final}
                onChange={handleInputChange}
                placeholder="Texto final"
                style={{ minHeight: 130 }}
              />
              <label htmlFor="finalCuestionario">Texto Final</label>
              <div className="form-text">Puedes añadir un mensaje de resultado.</div>
            </div>
          </div>
        </div>

        {/* Preferencias */}
        <div className="setting-card">
          <div className="setting-card__title">
            <i className="bi bi-toggles2"></i> Preferencias
          </div>

          <ul className="option-list">
            <li className="option-row">
              <div className="option-icon"><i className="bi bi-arrow-left-right"></i></div>
              <div className="option-body">
                <div className="option-title">Permitir navegación entre preguntas</div>
                <div className="option-desc">El participante puede revisar y editar respuestas.</div>
              </div>
              <div className="option-action">
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="navPreguntasQ"
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
                <div className="option-title">Mostrar respuestas correctas al finalizar</div>
                <div className="option-desc">Ideal para cuestionarios de práctica.</div>
              </div>
              <div className="option-action">
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="mostrarRespQ"
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

      {/* Columna derecha: Parámetros */}
      <div className="config-col config-col--side">
        <div className="setting-card">
          <div className="setting-card__title">
            <i className="bi bi-ui-checks"></i> Parámetros
          </div>

          <div className="param-grid">
            {/* Tiempo límite */}
            <div>
              <div className="form-label fw-semibold">Tiempo Límite (minutos)</div>
              <div className="param-card">
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
                <div className="input-group input-unit">
                  <input
                    type="number"
                    min="0"
                    max="180"
                    step="1"
                    name="tiempo_limite"
                    value={tiempo}
                    onChange={handleInputChange}
                    className="form-control text-end"
                    placeholder="0"
                  />
                  <span className="input-group-text">min</span>
                </div>
              </div>
            </div>

            {/* Umbral */}
            <div>
              <div className="form-label fw-semibold">Umbral de Aprobación</div>
              <div className="param-card">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={Number(umbral)}
                  onChange={(e) => setField("umbral_aprobacion", String(e.target.value))}
                  className="form-range"
                  aria-label="Umbral de aprobación (%)"
                />
                <div className="input-group input-unit">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    name="umbral_aprobacion"
                    value={umbral}
                    onChange={handleInputChange}
                    className="form-control text-end"
                    placeholder="70"
                  />
                  <span className="input-group-text">%</span>
                </div>
              </div>
              <div className="form-text">Se usa en reportes y reglas de aprobación.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
