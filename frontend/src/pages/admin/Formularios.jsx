import { useState, useEffect } from "react";  
import { useNavigate } from "react-router-dom";  
import Navbar from "../../components/Navbar";  
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch } from "react-icons/fa";  
  
export default function Formularios() {  
  const [formularios, setFormularios] = useState([]);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState("");  
  const [filtro, setFiltro] = useState("");  
  const [tipoFiltro, setTipoFiltro] = useState("todos");  
  const navigate = useNavigate();  
  
  // Obtener formularios del backend  
  useEffect(() => {  
    obtenerFormularios();  
  }, []);  
  
  const obtenerFormularios = async () => {  
    try {  
      setLoading(true);  
      const token = localStorage.getItem("token");  
        
      const response = await fetch("http://localhost:4000/admin/formularios", {  
        headers: {  
          "Authorization": `Bearer ${token}`,  
          "Content-Type": "application/json"  
        }  
      });  
  
      if (response.ok) {  
        const data = await response.json();  
        setFormularios(data.formularios || []);  
      } else {  
        setError("Error al cargar formularios");  
      }  
    } catch (error) {  
      setError("Error de conexión");  
      console.error("Error:", error);  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  // Filtrar formularios  
  const formulariosFiltrados = formularios.filter(formulario => {  
    const coincideTexto = formulario.titulo.toLowerCase().includes(filtro.toLowerCase()) ||  
                         formulario.descripcion?.toLowerCase().includes(filtro.toLowerCase());  
    const coincideTipo = tipoFiltro === "todos" || formulario.tipo === tipoFiltro;  
      
    return coincideTexto && coincideTipo;  
  });  
  
  // Eliminar formulario  
  const eliminarFormulario = async (codigo) => {  
    if (!confirm("¿Estás seguro de eliminar este formulario?")) return;  
  
    try {  
      const token = localStorage.getItem("token");  
        
      const response = await fetch(`http://localhost:4000/admin/formularios/${codigo}`, {  
        method: "DELETE",  
        headers: {  
          "Authorization": `Bearer ${token}`,  
          "Content-Type": "application/json"  
        }  
      });  
  
      if (response.ok) {  
        setFormularios(formularios.filter(f => f.codigo !== codigo));  
      } else {  
        setError("Error al eliminar formulario");  
      }  
    } catch (error) {  
      setError("Error de conexión");  
      console.error("Error:", error);  
    }  
  };  
  
  const formatearFecha = (fecha) => {  
    if (!fecha) return "No definida";  
    return new Date(fecha).toLocaleDateString();  
  };  
  
  const obtenerColorEstatus = (estatus) => {  
    return estatus === "abierto"   
      ? "bg-green-100 text-green-800"   
      : "bg-red-100 text-red-800";  
  };  
  
  const obtenerColorTipo = (tipo) => {  
    return tipo === "Encuesta"   
      ? "bg-blue-100 text-blue-800"   
      : "bg-purple-100 text-purple-800";  
  };  
  
  return (  
    <div className="min-h-screen flex flex-col">  
      <Navbar rol="admin" nombre={localStorage.getItem("nombre") || "Admin"} />  
        
      <main className="flex-1 p-6 bg-gray-100">  
        <div className="max-w-7xl mx-auto">  
          {/* Header */}  
          <div className="flex justify-between items-center mb-6">  
            <div>  
              <h1 className="text-3xl font-bold text-gray-900">Gestionar Formularios</h1>  
              <p className="text-gray-600 mt-2">Administra todos los formularios del sistema</p>  
            </div>  
            <button  
              onClick={() => navigate("/admin/formulario/crear")}  
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"  
            >  
              <FaPlus /> Crear Formulario  
            </button>  
          </div>  
  
          {/* Filtros */}  
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">  
            <div className="flex flex-col md:flex-row gap-4">  
              <div className="flex-1">  
                <div className="relative">  
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />  
                  <input  
                    type="text"  
                    placeholder="Buscar por título o descripción..."  
                    value={filtro}  
                    onChange={(e) => setFiltro(e.target.value)}  
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"  
                  />  
                </div>  
              </div>  
              <div className="md:w-48">  
                <select  
                  value={tipoFiltro}  
                  onChange={(e) => setTipoFiltro(e.target.value)}  
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"  
                >  
                  <option value="todos">Todos los tipos</option>  
                  <option value="Encuesta">Encuestas</option>  
                  <option value="Cuestionario">Cuestionarios</option>  
                </select>  
              </div>  
            </div>  
          </div>  
  
          {/* Contenido */}  
          {loading ? (  
            <div className="text-center py-12">  
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>  
              <p className="mt-4 text-gray-600">Cargando formularios...</p>  
            </div>  
          ) : error ? (  
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">  
              {error}  
            </div>  
          ) : formulariosFiltrados.length === 0 ? (  
            <div className="text-center py-12">  
              <p className="text-gray-500 text-lg">No se encontraron formularios</p>  
              <button  
                onClick={() => navigate("/admin/formulario/crear")}  
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"  
              >  
                Crear tu primer formulario  
              </button>  
            </div>  
          ) : (  
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">  
              <div className="overflow-x-auto">  
                <table className="min-w-full divide-y divide-gray-200">  
                  <thead className="bg-gray-50">  
                    <tr>  
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">  
                        Formulario  
                      </th>  
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">  
                        Tipo  
                      </th>  
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">  
                        Estado  
                      </th>  
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">  
                        Fechas  
                      </th>  
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">  
                        Acciones  
                      </th>  
                    </tr>  
                  </thead>  
                  <tbody className="bg-white divide-y divide-gray-200">  
                    {formulariosFiltrados.map((formulario) => (  
                      <tr key={formulario.codigo} className="hover:bg-gray-50">  
                        <td className="px-6 py-4">  
                          <div>  
                            <div className="text-sm font-medium text-gray-900">  
                              {formulario.titulo}  
                            </div>  
                            <div className="text-sm text-gray-500">  
                              {formulario.descripcion}  
                            </div>  
                            <div className="text-xs text-gray-400 mt-1">  
                              Código: {formulario.codigo}  
                            </div>  
                          </div>  
                        </td>  
                        <td className="px-6 py-4">  
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorTipo(formulario.tipo)}`}>  
                            {formulario.tipo}  
                          </span>  
                        </td>  
                        <td className="px-6 py-4">  
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorEstatus(formulario.estatus)}`}>  
                            {formulario.estatus}  
                          </span>  
                        </td>  
                        <td className="px-6 py-4 text-sm text-gray-500">  
                          <div>Inicio: {formatearFecha(formulario.fecha_inicio)}</div>  
                          <div>Fin: {formatearFecha(formulario.fecha_fin)}</div>  
                        </td>  
                        <td className="px-6 py-4">  
                          <div className="flex space-x-2">  
                            <button  
                              onClick={() => {/* TODO: Ver detalles */}}  
                              className="text-blue-600 hover:text-blue-900 p-1"  
                              title="Ver detalles"  
                            >  
                              <FaEye />  
                            </button>  
                            <button  
                              onClick={() => {/* TODO: Editar formulario */}}  
                              className="text-green-600 hover:text-green-900 p-1"  
                              title="Editar"  
                            >  
                              <FaEdit />  
                            </button>  
                            <button  
                              onClick={() => {/* TODO: Gestionar preguntas */}}  
                              className="text-purple-600 hover:text-purple-900 p-1"  
                              title="Gestionar preguntas"  
                            >  
                              <FaPlus />  
                            </button>  
                            <button  
                              onClick={() => eliminarFormulario(formulario.codigo)}  
                              className="text-red-600 hover:text-red-900 p-1"  
                              title="Eliminar"  
                            >  
                              <FaTrash />  
                            </button>  
                          </div>  
                        </td>  
                      </tr>  
                    ))}  
                  </tbody>  
                </table>  
              </div>  
            </div>  
          )}  
        </div>  
      </main>  
    </div>  
  );  
}