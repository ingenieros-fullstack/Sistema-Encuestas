import { useState, useEffect } from "react";
import "../../GestionUsuarios.css";

const API_URL = import.meta.env.VITE_API_URL;
const USUARIOS_POR_PAGINA = 5;

export default function GestionUsuariosModal({ onClose }) {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [correoBusqueda, setCorreoBusqueda] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [form, setForm] = useState({ rol: "", nuevaPass: "", confirmarPass: "" });
  const [paginaActual, setPaginaActual] = useState(1);

  // === Cargar usuarios
  useEffect(() => {
    fetch(`${API_URL}/usuarios?q=${busqueda}`)
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(data);
        setPaginaActual(1);
      })
      .catch((err) => console.error("Error cargando usuarios:", err));
  }, [busqueda]);

  // === Buscar usuario
  const handleBuscarUsuario = (correo = correoBusqueda) => {
    if (!correo) return;
    setCorreoBusqueda(correo);

    fetch(`${API_URL}/usuarios/by-email?email=${correo}`)
      .then((res) => {
        if (!res.ok) throw new Error("No encontrado");
        return res.json();
      })
      .then((data) => {
        setUsuarioEncontrado(data);
        setForm({ rol: data.rol, nuevaPass: "", confirmarPass: "" });
        // 🔹 Llevar el foco visual al panel derecho
        document.querySelector(".right-panel")?.scrollIntoView({ behavior: "smooth" });
      })
      .catch(() => {
        alert("⚠️ Usuario no encontrado");
        setUsuarioEncontrado(null);
      });
  };

  // === Editar usuario desde tabla
  const handleEditar = (correo) => {
    setCorreoBusqueda(correo); // ✅ rellenar automáticamente el input
    handleBuscarUsuario(correo);
  };

  // === Actualizar usuario
  const handleActualizarUsuario = async (e) => {
    e.preventDefault();
    if (!usuarioEncontrado) return;
    if (form.nuevaPass !== form.confirmarPass) {
      alert("⚠️ Las contraseñas no coinciden");
      return;
    }

    const payload = { email: usuarioEncontrado.correo, rol: form.rol };
    if (form.nuevaPass) payload.password = form.nuevaPass;

    try {
      const res = await fetch(`${API_URL}/usuarios/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Usuario actualizado");
        setUsuarioEncontrado(null);
        setCorreoBusqueda("");
        setForm({ rol: "", nuevaPass: "", confirmarPass: "" });
        setBusqueda("");
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // === Eliminar
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    try {
      await fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
      setUsuarios(usuarios.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Error eliminando usuario:", err);
    }
  };

  // === Badges por rol
  const getBadgeClass = (rol) => {
    switch (rol.toLowerCase()) {
      case "admin": return "badge badge-blue";
      case "supervisor": return "badge badge-yellow";
      case "empleado": return "badge badge-green";
      default: return "badge badge-gray";
    }
  };

  // === Paginación
  const totalPaginas = Math.ceil(usuarios.length / USUARIOS_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * USUARIOS_POR_PAGINA;
  const usuariosPaginados = usuarios.slice(indiceInicio, indiceInicio + USUARIOS_POR_PAGINA);

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h5 className="modal-title"><i className="bi bi-people-fill"></i> Gestión de Usuarios</h5>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="two-column-layout">
          {/* === Columna izquierda: Tabla === */}
          <div className="left-panel">
            <h6><i className="bi bi-list-ul"></i> Lista de Usuarios</h6>
            <input
              type="text"
              placeholder="Buscar por nombre o correo"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="mb-3 form-control"
            />

            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>Nombre</th>
                    <th>Correo electrónico</th>
                    <th>Centro de trabajo</th>
                    <th>Departamento</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosPaginados.map((u) => (
                    <tr key={u.id}>
                      <td>{u.nombre || "-"}</td>
                      <td>{u.correo}</td>
                      <td>{u.centroTrabajo || "-"}</td>
                      <td>{u.departamento || "-"}</td>
                      <td><span className={getBadgeClass(u.rol)}>{u.rol}</span></td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEditar(u.correo)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleEliminar(u.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usuarios.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No hay usuarios para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {usuarios.length > USUARIOS_POR_PAGINA && (
              <div className="pagination-controls d-flex justify-content-between align-items-center">
                <button
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="btn btn-secondary"
                >
                  ← Anterior
                </button>
                <span>Página {paginaActual} de {totalPaginas}</span>
                <button
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="btn btn-secondary"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>

          {/* === Columna derecha: Editar usuario === */}
          <div className="right-panel">
            <h6><i className="bi bi-person-gear"></i> Editar Usuario</h6>
            <input
              type="email"
              placeholder="Correo del empleado"
              value={correoBusqueda}
              onChange={(e) => setCorreoBusqueda(e.target.value)}
              className="mb-2 form-control"
            />
            <button className="btn btn-primary mb-3 w-100" onClick={() => handleBuscarUsuario()}>
              <i className="bi bi-search"></i> Buscar
            </button>

            {usuarioEncontrado && (
              <form onSubmit={handleActualizarUsuario} className="form-compact">
                <div className="mb-2">
                  <label className="form-label">Correo</label>
                  <input type="email" className="form-control" value={usuarioEncontrado.correo} disabled />
                </div>
                <div className="mb-2">
                  <label className="form-label">Rol</label>
                  <select
                    className="form-select"
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  >
                    <option value="admin">Admin</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="empleado">Empleado</option>
                  </select>
                </div>
                <div className="row">
                  <div className="col">
                    <label className="form-label">Nueva Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.nuevaPass}
                      onChange={(e) => setForm({ ...form, nuevaPass: e.target.value })}
                    />
                  </div>
                  <div className="col">
                    <label className="form-label">Confirmar</label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.confirmarPass}
                      onChange={(e) => setForm({ ...form, confirmarPass: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-success w-100 mt-3">Actualizar Usuario</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
