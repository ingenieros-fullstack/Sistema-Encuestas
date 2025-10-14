// src/pages/admin/GestionUsuariosModal.jsx
import { useState, useEffect } from "react";
import "../../GestionUsuarios.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const USUARIOS_POR_PAGINA = 5;

export default function GestionUsuariosModal({ onClose }) {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [correoBusqueda, setCorreoBusqueda] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [form, setForm] = useState({ rol: "", nuevaPass: "", confirmarPass: "" });
  const [paginaActual, setPaginaActual] = useState(1);
  const token = localStorage.getItem("token");

  const normalizar = (str) => (str || "").toLowerCase().trim();

  // === Cargar usuarios desde backend ===
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch(
          `${API_URL}/admin/usuarios?q=${encodeURIComponent(busqueda)}`,
          { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data = await res.json();
        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data.usuarios)
          ? data.usuarios
          : [];

        setUsuarios(lista);
        setPaginaActual(1);
      } catch (err) {
        console.error("❌ Error cargando usuarios:", err);
        setUsuarios([]);
      }
    };
    fetchUsuarios();
  }, [busqueda, token]);

  // === Filtrado local adicional (correo o rol) ===
  const usuariosFiltrados = usuarios.filter((u) => {
    if (!busqueda) return true;
    const query = normalizar(busqueda);
    return (
      normalizar(u.correo_electronico).includes(query) ||
      normalizar(u.rol).includes(query)
    );
  });

  // === Buscar usuario por correo ===
  const handleBuscarUsuario = async (correo = correoBusqueda) => {
    if (!correo) return alert("Ingrese un correo para buscar");

    try {
      const res = await fetch(
        `${API_URL}/admin/usuarios/by-email?email=${encodeURIComponent(correo)}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
      );

      if (!res.ok) throw new Error("Usuario no encontrado");
      const data = await res.json();

      setUsuarioEncontrado(data);
      setForm({ rol: data.rol, nuevaPass: "", confirmarPass: "" });
      document.querySelector(".right-panel")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      alert("⚠️ Usuario no encontrado o error de servidor");
      setUsuarioEncontrado(null);
    }
  };

  // === Editar usuario desde tabla ===
  const handleEditar = (correo) => {
    setCorreoBusqueda(correo);
    handleBuscarUsuario(correo);
  };

  // === Actualizar usuario ===
  const handleActualizarUsuario = async (e) => {
    e.preventDefault();
    if (!usuarioEncontrado) return;
    if (form.nuevaPass && form.nuevaPass !== form.confirmarPass) {
      return alert("⚠️ Las contraseñas no coinciden");
    }

    const payload = {
      email: usuarioEncontrado.correo,
      rol: form.rol,
    };
    if (form.nuevaPass) payload.password = form.nuevaPass;

    try {
      const res = await fetch(`${API_URL}/admin/usuarios/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");

      alert("✅ Usuario actualizado correctamente");
      setUsuarioEncontrado(null);
      setCorreoBusqueda("");
      setForm({ rol: "", nuevaPass: "", confirmarPass: "" });
      setBusqueda("");
    } catch (err) {
      console.error("Error actualizando:", err);
      alert("❌ No se pudo actualizar el usuario");
    }
  };

  // === Eliminar usuario ===
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    try {
      await fetch(`${API_URL}/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios((prev) => prev.filter((u) => u.id_usuario !== id));
    } catch (err) {
      console.error("Error eliminando usuario:", err);
    }
  };

  // === Estilos de etiquetas por rol ===
  const getBadgeClass = (rol) => {
    switch (rol?.toLowerCase()) {
      case "admin":
        return "badge badge-blue";
      case "supervisor":
        return "badge badge-yellow";
      case "empleado":
        return "badge badge-green";
      default:
        return "badge badge-gray";
    }
  };

  // === Paginación ===
  const totalPaginas = Math.ceil(usuariosFiltrados.length / USUARIOS_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * USUARIOS_POR_PAGINA;
  const usuariosPaginados = usuariosFiltrados.slice(
    indiceInicio,
    indiceInicio + USUARIOS_POR_PAGINA
  );

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target.classList.contains("modal-backdrop") && onClose()}
    >
      <div className="modal-container">
        {/* === Header === */}
        <div className="modal-header">
          <h5 className="modal-title">
            <i className="bi bi-people-fill"></i> Gestión de Usuarios
          </h5>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="two-column-layout">
          {/* === Panel izquierdo: lista === */}
          <div className="left-panel">
            <h6>
              <i className="bi bi-list-ul"></i> Lista de Usuarios
            </h6>
            <input
              type="text"
              placeholder="Buscar por correo o rol"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="mb-3 form-control"
            />

            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>Correo electrónico</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosPaginados.map((u) => (
                    <tr key={u.id_usuario}>
                      <td>{u.correo_electronico}</td>
                      <td>
                        <span className={getBadgeClass(u.rol)}>{u.rol}</span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEditar(u.correo_electronico)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleEliminar(u.id_usuario)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usuariosPaginados.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">
                        No hay usuarios para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* === Paginación === */}
            {usuariosFiltrados.length > USUARIOS_POR_PAGINA && (
              <div className="pagination-controls d-flex justify-content-between align-items-center">
                <button
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="btn btn-secondary"
                >
                  ← Anterior
                </button>
                <span>
                  Página {paginaActual} de {totalPaginas}
                </span>
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

          {/* === Panel derecho: editar === */}
          <div className="right-panel">
            <h6>
              <i className="bi bi-person-gear"></i> Editar Usuario
            </h6>
            <input
              type="email"
              placeholder="Correo del empleado"
              value={correoBusqueda}
              onChange={(e) => setCorreoBusqueda(e.target.value)}
              className="mb-2 form-control"
            />
            <button
              className="btn btn-primary mb-3 w-100"
              onClick={() => handleBuscarUsuario()}
            >
              <i className="bi bi-search"></i> Buscar
            </button>

            {usuarioEncontrado && (
              <form onSubmit={handleActualizarUsuario} className="form-compact">
                <div className="mb-2">
                  <label className="form-label">Correo</label>
                  <input
                    type="email"
                    className="form-control"
                    value={usuarioEncontrado.correo || ""}
                    disabled
                  />
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
                      onChange={(e) =>
                        setForm({ ...form, nuevaPass: e.target.value })
                      }
                    />
                  </div>
                  <div className="col">
                    <label className="form-label">Confirmar</label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.confirmarPass}
                      onChange={(e) =>
                        setForm({ ...form, confirmarPass: e.target.value })
                      }
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-success w-100 mt-3">
                  Actualizar Usuario
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
