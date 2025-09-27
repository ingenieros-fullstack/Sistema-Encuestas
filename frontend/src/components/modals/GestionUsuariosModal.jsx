import { useState, useEffect } from "react";
import "../../GestionUsuarios.css";

const API_URL = import.meta.env.VITE_API_URL;
const USUARIOS_POR_PAGINA = 6;

export default function GestionUsuariosModal({ onClose }) {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [correoBusqueda, setCorreoBusqueda] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [form, setForm] = useState({ rol: "", nuevaPass: "", confirmarPass: "" });
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/usuarios?q=${busqueda}`)
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(data);
        setPaginaActual(1);
      })
      .catch((err) => console.error("Error cargando usuarios:", err));
  }, [busqueda]);

  const handleBuscarUsuario = () => {
    fetch(`${API_URL}/usuarios/by-email?email=${correoBusqueda}`)
      .then((res) => {
        if (!res.ok) throw new Error("No encontrado");
        return res.json();
      })
      .then((data) => {
        setUsuarioEncontrado(data);
        setForm({ rol: data.rol, nuevaPass: "", confirmarPass: "" });
      })
      .catch(() => {
        alert("⚠️ Usuario no encontrado");
        setUsuarioEncontrado(null);
      });
  };

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

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    try {
      await fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
      setUsuarios(usuarios.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Error eliminando usuario:", err);
    }
  };

  const getBadgeClass = (rol) => {
    switch (rol.toLowerCase()) {
      case "admin": return "badge badge-blue";
      case "supervisor": return "badge badge-yellow";
      case "empleado": return "badge badge-green";
      default: return "badge badge-gray";
    }
  };

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

        {/* Contenedor dos columnas */}
        <div className="two-column-layout">
          {/* Columna Izquierda: Lista de usuarios */}
          <div className="left-panel">
            <h6><i className="bi bi-list-ul"></i> Lista de Usuarios</h6>
            <input
              type="text"
              placeholder="🔍 Buscar por nombre"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="mb-3"
            />

            <div className="user-card-grid">
              {usuariosPaginados.map((u) => (
                <div className="user-card" key={u.id}>
                  <button className="btn-delete" onClick={() => handleEliminar(u.id)}>
                    <i className="bi bi-trash-fill"></i>
                  </button>
                  <h6>{u.nombre}</h6>
                  <p>{u.correo}</p>
                  <span className={getBadgeClass(u.rol)}>{u.rol}</span>
                  <p className="mt-2">Contraseña: ********</p>
                </div>
              ))}
              {usuarios.length === 0 && <p className="text-muted">No hay usuarios para mostrar.</p>}
            </div>

            {usuarios.length > USUARIOS_POR_PAGINA && (
              <div className="pagination-controls">
                <button onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} className="btn btn-secondary">
                  ← Anterior
                </button>
                <span className="pagination-info">Página {paginaActual} de {totalPaginas}</span>
                <button onClick={() => setPaginaActual(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="btn btn-secondary">
                  Siguiente →
                </button>
              </div>
            )}
          </div>

          {/* Columna Derecha: Actualizar usuario */}
          <div className="right-panel">
            <h6><i className="bi bi-person-gear"></i> Actualizar Usuario</h6>
            <input
              type="email"
              placeholder="Correo del empleado"
              value={correoBusqueda}
              onChange={(e) => setCorreoBusqueda(e.target.value)}
              className="mb-2"
            />
            <button className="btn btn-primary mb-3" onClick={handleBuscarUsuario}>
              <i className="bi bi-search"></i> Buscar
            </button>

            {usuarioEncontrado && (
              <form onSubmit={handleActualizarUsuario}>
                <div className="mb-3">
                  <label className="form-label">Correo</label>
                  <input type="email" className="form-control" value={usuarioEncontrado.correo} disabled />
                </div>
                <div className="mb-3">
                  <label className="form-label">Rol</label>
                  <select className="form-select" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                    <option value="admin">Admin</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="empleado">Empleado</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Nueva Contraseña</label>
                  <input type="password" className="form-control" value={form.nuevaPass} onChange={(e) => setForm({ ...form, nuevaPass: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar Contraseña</label>
                  <input type="password" className="form-control" value={form.confirmarPass} onChange={(e) => setForm({ ...form, confirmarPass: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-success w-100">Actualizar Usuario</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
