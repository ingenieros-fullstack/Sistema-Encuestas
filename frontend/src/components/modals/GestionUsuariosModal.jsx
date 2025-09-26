// src/components/modals/GestionUsuariosModal.jsx
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function GestionUsuariosModal({ onClose }) {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [correoBusqueda, setCorreoBusqueda] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [form, setForm] = useState({ rol: "", nuevaPass: "", confirmarPass: "" });

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      onClose();
    }
  };

  // 🔹 Cargar usuarios en la tabla
  useEffect(() => {
    fetch(`${API_URL}/usuarios?q=${busqueda}`)
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error("Error cargando usuarios:", err));
  }, [busqueda]);

  // 🔹 Buscar usuario por correo
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

  // 🔹 Actualizar usuario
  const handleActualizarUsuario = async (e) => {
    e.preventDefault();
    if (!usuarioEncontrado) return;
    if (form.nuevaPass !== form.confirmarPass) {
      alert("⚠️ Las contraseñas no coinciden");
      return;
    }

    const payload = {
      email: usuarioEncontrado.correo,
      rol: form.rol,
    };
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
        setBusqueda(""); // refresca tabla
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // 🔹 Eliminar usuario
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    try {
      await fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
      setUsuarios(usuarios.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Error eliminando usuario:", err);
    }
  };

  const usuariosFiltrados = usuarios;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-centered modal-xl">
        <div className="modal-header bg-success text-white d-flex justify-content-between align-items-center">
          <h5 className="modal-title m-0">👥 Gestión de Usuarios</h5>
          <button className="btn-close text-white" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="row">
            {/* Panel izquierdo: tabla */}
            <div className="col-md-7 border-end">
              <h6 className="mb-3">Lista de Usuarios</h6>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="🔍 Buscar por nombre"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Contraseña</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u) => (
                    <tr key={u.id}>
                      <td>{u.nombre}</td>
                      <td>{u.correo}</td>
                      <td>{u.rol}</td>
                      <td>{"*".repeat(8)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleEliminar(u.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Panel derecho: actualizar */}
            <div className="col-md-5 ps-4">
              <h6 className="mb-3">🔑 Actualizar Usuario</h6>
              <div className="d-flex mb-3">
                <input
                  type="email"
                  className="form-control me-2"
                  placeholder="Correo del empleado"
                  value={correoBusqueda}
                  onChange={(e) => setCorreoBusqueda(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleBuscarUsuario}>
                  🔍 Buscar
                </button>
              </div>

              {usuarioEncontrado && (
                <form onSubmit={handleActualizarUsuario}>
                  <div className="mb-3">
                    <label className="form-label">Correo</label>
                    <input type="email" className="form-control" value={usuarioEncontrado.correo} disabled />
                  </div>
                  <div className="mb-3">
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
                  <div className="mb-3">
                    <label className="form-label">Nueva Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.nuevaPass}
                      onChange={(e) => setForm({ ...form, nuevaPass: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirmar Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.confirmarPass}
                      onChange={(e) => setForm({ ...form, confirmarPass: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-success w-100">
                    Actualizar Usuario
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
