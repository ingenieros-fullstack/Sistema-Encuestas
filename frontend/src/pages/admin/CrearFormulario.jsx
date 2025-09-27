import { useState } from "react";  
import { useNavigate } from "react-router-dom";  
import Navbar from "../../components/Navbar";  
import EncuestaConfig from "../../components/forms/EncuestaConfig";  
import CuestionarioConfig from "../../components/forms/CuestionarioConfig";  
  
export default function CrearFormulario() {  
  const [formData, setFormData] = useState({  
    titulo: "",  
    descripcion: "",  
    tipo: "Encuesta",  
    fecha_inicio: "",  
    fecha_fin: "",  
    // Campos específicos para Encuesta  
    introduccion: "",  
    texto_final: "",  
    // Campos específicos para Cuestionario  
    umbral_aprobacion: "",  
    tiempo_limite: "",  
    navegacion_preguntas: false,  
    mostrar_respuestas: false  
  });  
  
  const [mensaje, setMensaje] = useState("");  
  const [loading, setLoading] = useState(false);  
  const navigate = useNavigate();  
  
  const handleInputChange = (e) => {  
    const { name, value, type, checked } = e.target;  
    setFormData(prev => ({  
      ...prev,  
      [name]: type === 'checkbox' ? checked : value  
    }));  
  };  
  
  const handleSubmit = async (e) => {  
    e.preventDefault();  
    setLoading(true);  
    setMensaje("");  
  
    try {  
      const token = localStorage.getItem("token");  
        
      const response = await fetch("http://localhost:4000/admin/formularios", {  
        method: "POST",  
        headers: {  
          "Content-Type": "application/json",  
          "Authorization": `Bearer ${token}`  
        },  
        body: JSON.stringify(formData)  
      });  
  
      const data = await response.json();  
  
      if (response.ok) {  
        setMensaje("Formulario creado exitosamente");  
        setTimeout(() => {  
          navigate("/admin/formularios");  
        }, 2000);  
      } else {  
        setMensaje(data.message || "Error al crear formulario");  
      }  
    } catch (error) {  
      setMensaje("Error de conexión");  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  return (  
    <div className="min-h-screen flex flex-col">  
      <Navbar rol="admin" nombre={localStorage.getItem("nombre") || "Admin"} />  
        
      <main className="flex-1 p-6 bg-gray-100">  
        <div className="max-w-4xl mx-auto">  
          <div className="bg-white rounded-lg shadow-md p-6">  
            <h1 className="text-2xl font-bold mb-6">Crear Nuevo Formulario</h1>  
              
            <form onSubmit={handleSubmit} className="space-y-6">  
              {/* Información Básica */}  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-2">  
                    Título del Formulario *  
                  </label>  
                  <input  
                    type="text"  
                    name="titulo"  
                    value={formData.titulo}  
                    onChange={handleInputChange}  
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
                    required  
                  />  
                </div>  
  
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-2">  
                    Tipo de Formulario *  
                  </label>  
                  <select  
                    name="tipo"  
                    value={formData.tipo}  
                    onChange={handleInputChange}  
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
                    required  
                  >  
                    <option value="Encuesta">Encuesta General</option>  
                    <option value="Cuestionario">Cuestionario Evaluativo</option>  
                  </select>  
                </div>  
              </div>  
  
              <div>  
                <label className="block text-sm font-medium text-gray-700 mb-2">  
                  Descripción  
                </label>  
                <textarea  
                  name="descripcion"  
                  value={formData.descripcion}  
                  onChange={handleInputChange}  
                  rows="3"  
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
                />  
              </div>  
  
              {/* Fechas */}  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-2">  
                    Fecha de Inicio  
                  </label>  
                  <input  
                    type="date"  
                    name="fecha_inicio"  
                    value={formData.fecha_inicio}  
                    onChange={handleInputChange}  
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
                  />  
                </div>  
  
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-2">  
                    Fecha de Fin  
                  </label>  
                  <input  
                    type="date"  
                    name="fecha_fin"  
                    value={formData.fecha_fin}  
                    onChange={handleInputChange}  
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
                  />  
                </div>  
              </div>  
  
              {/* Configuración Específica por Tipo */}  
              {formData.tipo === "Encuesta" && (  
                <EncuestaConfig   
                  formData={formData}   
                  handleInputChange={handleInputChange}   
                />  
              )}  
  
              {formData.tipo === "Cuestionario" && (  
                <CuestionarioConfig   
                  formData={formData}   
                  handleInputChange={handleInputChange}   
                />  
              )}  
  
              {/* Botones de Acción */}  
              <div className="flex justify-end space-x-4">  
                <button  
                  type="button"  
                  onClick={() => navigate("/admin/formularios")}  
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"  
                >  
                  Cancelar  
                </button>  
                <button  
                  type="submit"  
                  disabled={loading}  
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"  
                >  
                  {loading ? "Creando..." : "Crear Formulario"}  
                </button>  
              </div>  
  
              {/* Mensaje de Estado */}  
              {mensaje && (  
                <div className={`p-4 rounded-md ${  
                  mensaje.includes("exitosamente")   
                    ? "bg-green-50 text-green-800 border border-green-200"   
                    : "bg-red-50 text-red-800 border border-red-200"  
                }`}>  
                  {mensaje}  
                </div>  
              )}  
            </form>  
          </div>  
        </div>  
      </main>  
    </div>  
  );  
}