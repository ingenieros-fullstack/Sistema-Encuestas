import React from "react";

export default function PanelSecciones({
  secciones,
  buscarSec,
  setBuscarSec,
  nuevaSeccion,
  setNuevaSeccion,
  crearSeccion,
  eliminarSeccion,
  setModalEditarSeccion,
  seccionSeleccionada,
  setSeccionSeleccionada,
}) {
  return (
    <aside className="gs2-pane gs2-left">
      <div className="gs2-pane-header">
        <div className="gs2-pane-title">Secciones</div>
        <input
          className="gs2-input"
          placeholder="Buscar sección…"
          value={buscarSec}
          onChange={(e) => setBuscarSec(e.target.value)}
        />
      </div>

      <div className="gs2-pane-body">
        <ul className="gs2-list">
          {secciones
            .filter((s) =>
              s.nombre_seccion.toLowerCase().includes(buscarSec.toLowerCase())
            )
            .map((s) => (
              <li
                key={s.id_seccion}
                className={
                  "gs2-list-item " +
                  (String(s.id_seccion) === String(seccionSeleccionada)
                    ? "active"
                    : "")
                }
                onClick={() => setSeccionSeleccionada(s.id_seccion)}
              >
                <div className="gs2-list-text">
                  <div className="gs2-list-title">{s.nombre_seccion}</div>
                  {!!s.tema && <div className="gs2-list-sub">{s.tema}</div>}
                  {s.condicion_pregunta_id && (
                    <div className="gs2-list-sub small text-muted">
                      Condición: Pregunta {s.condicion_pregunta_id} = "
                      {s.condicion_valor}"
                    </div>
                  )}
                </div>
                <div className="gs2-actions">
                  <button
                    className="gs2-icon"
                    title="Editar"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalEditarSeccion(s);
                    }}
                  >
                    ✎
                  </button>
                  <button
                    className="gs2-icon danger"
                    title="Eliminar"
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarSeccion(s.id_seccion);
                    }}
                  >
                    🗑
                  </button>
                </div>
              </li>
            ))}
          {!secciones.length && <li className="gs2-empty">No hay secciones.</li>}
        </ul>
      </div>

      <div className="gs2-pane-footer">
        <input
          className="gs2-input"
          placeholder="Nombre de sección"
          value={nuevaSeccion.nombre_seccion}
          onChange={(e) =>
            setNuevaSeccion({ ...nuevaSeccion, nombre_seccion: e.target.value })
          }
        />
        <input
          className="gs2-input"
          placeholder="Tema"
          value={nuevaSeccion.tema}
          onChange={(e) =>
            setNuevaSeccion({ ...nuevaSeccion, tema: e.target.value })
          }
        />

        {/* 🔹 Condicional entre secciones */}
        <div className="gs2-form-row">
          <label>Condición (opcional)</label>
          <select
            className="gs2-input"
            value={nuevaSeccion.condicion_pregunta_id || ""}
            onChange={(e) =>
              setNuevaSeccion({
                ...nuevaSeccion,
                condicion_pregunta_id: e.target.value,
              })
            }
          >
            <option value="">— Ninguna —</option>
            {secciones
              .flatMap((s) => s.Preguntas || [])
              .filter((p) => p.tipo_pregunta === "condicional")
              .map((p) => (
                <option key={p.id_pregunta} value={p.id_pregunta}>
                  {p.enunciado}
                </option>
              ))}
          </select>
        </div>

        {nuevaSeccion.condicion_pregunta_id && (
          <div className="gs2-form-row">
            <label>Valor esperado</label>
            <select
              className="gs2-input"
              value={nuevaSeccion.condicion_valor || "si"}
              onChange={(e) =>
                setNuevaSeccion({
                  ...nuevaSeccion,
                  condicion_valor: e.target.value,
                })
              }
            >
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
        )}

        <button
          className="gs2-btn gs2-btn-primary w-100"
          onClick={crearSeccion}
          disabled={!nuevaSeccion.nombre_seccion.trim()}
        >
          ➕ Crear sección
        </button>
      </div>
    </aside>
  );
}
