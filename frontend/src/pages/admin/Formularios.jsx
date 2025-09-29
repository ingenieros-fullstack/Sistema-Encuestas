import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../GestionFormularios.css";
import { FaEdit } from "react-icons/fa";

export default function Formularios() {
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");

  // Paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    obtenerFormularios();
  }, []);

  const obtenerFormularios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/admin/formularios", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormularios(data.formularios || []);
      } else {
        setError("Error al cargar formularios");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (codigo) => {
    navigate(`/admin/formularios/editar/${codigo}`);
  };

  const eliminarFormulario = async (codigo) => {
    if (!window.confirm("¿Estás seguro de eliminar este formulario?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/admin/formularios/${codigo}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        setFormularios((prev) => prev.filter((f) => f.codigo !== codigo));
      } else {
        setError("Error al eliminar formulario");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "No definida";
    try {
      return new Date(fecha).toLocaleDateString();
    } catch {
      return "No definida";
    }
  };

  // ---------- FILTRO ----------
  const formulariosFiltrados = useMemo(() => {
    const text = filtro.trim().toLowerCase();
    return (formularios || []).filter((f) => {
      const coincideTexto =
        f.titulo?.toLowerCase().includes(text) ||
        f.descripcion?.toLowerCase().includes(text) ||
        f.codigo?.toLowerCase().includes(text);
      const coincideTipo = tipoFiltro === "todos" || f.tipo === tipoFiltro;
      return coincideTexto && coincideTipo;
    });
  }, [formularios, filtro, tipoFiltro]);

  useEffect(() => {
    setPage(1);
  }, [filtro, tipoFiltro]);

  // ---------- PAGINACIÓN ----------
  const total = formulariosFiltrados.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageItems = formulariosFiltrados.slice(startIndex, endIndex);

  const goto = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  const buildPages = () => {
    const pages = [];
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, safePage - half);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // ---------- BADGES ----------
  const badgeTipo = (tipo) =>
    tipo === "Encuesta"
      ? "badge rounded-pill text-bg-primary"
      : "badge rounded-pill text-bg-indigo";
  const badgeEstado = (estado) =>
    estado === "abierto"
      ? "badge rounded-pill text-bg-success"
      : "badge rounded-pill text-bg-danger";

  const countEncuestas = formularios.filter((f) => f.tipo === "Encuesta").length;
  const countCuestionarios = formularios.filter((f) => f.tipo === "Cuestionario").length;

  return (
    <div className="min-vh-100 d-flex flex-column bg-body-tertiary">
      <Navbar rol="admin" nombre={localStorage.getItem("nombre") || "Admin"} />

      {/* HERO */}
      <header className="page-hero container-xxl">
        <div className="page-hero__surface page-hero--accent">
          <div className="d-flex align-items-center gap-3">
            <span className="hero-icon bi bi-ui-checks-grid"></span>
            <div>
              <h1 className="h3 mb-1">Gestionar Formularios</h1>
              <p className="mb-0 text-body-secondary">
                Administra todos los formularios del sistema
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="chips me-2 d-none d-sm-flex">
              <button
                type="button"
                className={`chip ${tipoFiltro === "todos" ? "active" : ""}`}
                onClick={() => setTipoFiltro("todos")}
              >
                <i className="bi bi-collection"></i> Todos
                <span className="ms-1 badge rounded-pill text-bg-light">
                  {formularios.length}
                </span>
              </button>
              <button
                type="button"
                className={`chip ${tipoFiltro === "Encuesta" ? "active" : ""}`}
                onClick={() => setTipoFiltro("Encuesta")}
              >
                <i className="bi bi-ui-radios-grid"></i> Encuestas
                <span className="ms-1 badge rounded-pill text-bg-light">
                  {countEncuestas}
                </span>
              </button>
              <button
                type="button"
                className={`chip ${tipoFiltro === "Cuestionario" ? "active" : ""}`}
                onClick={() => setTipoFiltro("Cuestionario")}
              >
                <i className="bi bi-journal-check"></i> Cuestionarios
                <span className="ms-1 badge rounded-pill text-bg-light">
                  {countCuestionarios}
                </span>
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/admin/formulario/crear")}
            >
              <i className="bi bi-plus-lg me-2"></i> Crear Formulario
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow-1 container-xxl py-4">
        {/* Contenido */}
        {loading ? (
          <section className="section-card">
            <div className="d-flex align-items-center gap-3">
              <div className="spinner-border text-primary" role="status" />
              <div className="text-body-secondary">Cargando formularios…</div>
            </div>
          </section>
        ) : error ? (
          <section className="section-card">
            <div className="alert alert-danger mb-0">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          </section>
        ) : total === 0 ? (
          <section className="section-card text-center">
            <h3 className="h5">No se encontraron formularios</h3>
            <p className="text-body-secondary mb-3">
              Prueba cambiando los filtros o crea un nuevo formulario.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/formulario/crear")}
            >
              <i className="bi bi-plus-lg me-1"></i> Crear tu primer formulario
            </button>
          </section>
        ) : (
          <section className="section-card">
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: 260 }}>Formulario</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th style={{ minWidth: 220 }}>Fechas</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((f) => (
                    <tr key={f.codigo}>
                      <td>
                        <div className="fw-semibold">{f.titulo}</div>
                        {f.descripcion && (
                          <div className="text-body-secondary small">{f.descripcion}</div>
                        )}
                        <div className="small text-secondary-emphasis mt-1">
                          <i className="bi bi-qr-code me-1"></i>
                          Código: {f.codigo}
                        </div>
                      </td>
                      <td>
                        <span className={badgeTipo(f.tipo)}>
                          {f.tipo === "Encuesta" ? (
                            <>
                              <i className="bi bi-ui-radios-grid me-1"></i>Encuesta
                            </>
                          ) : (
                            <>
                              <i className="bi bi-journal-check me-1"></i>Cuestionario
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <span className={badgeEstado(f.estatus)}>
                          <i
                            className={`bi me-1 ${
                              f.estatus === "abierto" ? "bi-unlock" : "bi-lock"
                            }`}
                          ></i>
                          {f.estatus}
                        </span>
                      </td>
                      <td className="text-body-secondary small">
                        <div>
                          <i className="bi bi-calendar-event me-1"></i>
                          Inicio: {formatearFecha(f.fecha_inicio)}
                        </div>
                        <div>
                          <i className="bi bi-calendar-check me-1"></i>
                          Fin: {formatearFecha(f.fecha_fin)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-1">
                          {/* 👁️ Preview */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            title="Previsualizar"
                            onClick={() =>
                              navigate(
                                f.tipo === "Encuesta"
                                  ? `/admin/encuestas/${f.codigo}/preview`
                                  : `/admin/cuestionarios/${f.codigo}/preview`
                              )
                            }
                          >
                            <i className="bi bi-eye"></i>
                          </button>

                          {/* ✏️ Editar */}
                          <button
                            onClick={() => handleEdit(f.codigo)}
                            className="btn-action edit"
                          >
                            <FaEdit />
                          </button>

                          {/* ❓ Gestionar preguntas */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            title="Gestionar preguntas"
                            onClick={() =>
                              navigate(
                                f.tipo === "Encuesta"
                                  ? `/admin/encuestas/${f.codigo}/secciones`
                                  : `/admin/cuestionarios/${f.codigo}/secciones`
                              )
                            }
                          >
                            <i className="bi bi-node-plus"></i>
                          </button>

                          {/* 📊 Respuestas */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info"
                            title="Ver respuestas"
                            onClick={() =>
                              navigate(
                                f.tipo === "Encuesta"
                                  ? `/admin/encuestas/${f.codigo}/respuestas`
                                  : `/admin/cuestionarios/${f.codigo}/respuestas`
                              )
                            }
                          >
                            <i className="bi bi-bar-chart-line"></i>
                          </button>

                          {/* 🌍 Resolver (simulación admin) */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            title="Ir a resolver"
                            onClick={() =>
                              navigate(
                                f.tipo === "Encuesta"
                                  ? `/admin/encuestas/${f.codigo}/resolver`
                                  : `/admin/cuestionarios/${f.codigo}/resolver`
                              )
                            }
                          >
                            <i className="bi bi-globe"></i>
                          </button>

                          {/* 📱 Generar QR */}
<button
  type="button"
  className="btn btn-sm btn-outline-secondary"
  title="Generar QR"
  onClick={() =>
    navigate(
      f.tipo === "Encuesta"
        ? `/admin/encuestas/${f.codigo}/qr`
        : `/admin/cuestionarios/${f.codigo}/qr`
    )
  }
>
  <i className="bi bi-qr-code"></i>
</button>


                          {/* 🗑️ Eliminar */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Eliminar"
                            onClick={() => eliminarFormulario(f.codigo)}
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer de paginación */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3">
              <div className="small text-body-secondary">
                Mostrando{" "}
                <strong>{total === 0 ? 0 : startIndex + 1}</strong>–
                <strong>{endIndex}</strong> de <strong>{total}</strong> resultados
              </div>

              <nav aria-label="Paginación de formularios">
                <ul className="pagination mb-0">
                  <li className={`page-item ${safePage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => goto(1)}>
                      &laquo;
                    </button>
                  </li>
                  <li className={`page-item ${safePage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => goto(safePage - 1)}>
                      Anterior
                    </button>
                  </li>

                  {buildPages().map((p) => (
                    <li
                      key={p}
                      className={`page-item ${p === safePage ? "active" : ""}`}
                    >
                      <button className="page-link" onClick={() => goto(p)}>
                        {p}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${safePage === totalPages ? "disabled" : ""}`}
                  >
                    <button className="page-link" onClick={() => goto(safePage + 1)}>
                      Siguiente
                    </button>
                  </li>
                  <li
                    className={`page-item ${safePage === totalPages ? "disabled" : ""}`}
                  >
                    <button className="page-link" onClick={() => goto(totalPages)}>
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
