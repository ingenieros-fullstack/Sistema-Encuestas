import { useState, useEffect } from 'react';  
import { useParams, useNavigate } from 'react-router-dom';  
import Navbar from '../../components/Navbar';  
  
export default function EditarFormulario() {  
  const { codigo } = useParams();  
  const navigate = useNavigate();  
  const [formulario, setFormulario] = useState({  
    titulo: '',  
    descripcion: '',  
    introduccion: '',  
    texto_final: '',  
    tipo: 'Cuestionario',  
    estatus: 'abierto',  
    fecha_inicio: '',  
    fecha_fin: '',  
    umbral_aprobacion: 70,  
    tiempo_limite: 45,  
    navegacion_preguntas: true,  
    mostrar_respuestas: true  
  });  
  const [loading, setLoading] = useState(true);  
  const [saving, setSaving] = useState(false);  
  const [error, setError] = useState('');  
    
  const nombre = localStorage.getItem("nombre") || "Administrador";  
  const rol = localStorage.getItem("rol") || "admin";  
  
  useEffect(() => {  
    fetchFormulario();  
  }, [codigo]);  
  
  const fetchFormulario = async () => {  
    try {  
      setLoading(true);  
      const token = localStorage.getItem('token');  
      console.log('Fetching formulario con código:', codigo);  
        
      const response = await fetch(`http://localhost:4000/admin/formularios/${codigo}`, {  
        headers: {  
          'Authorization': `Bearer ${token}`,  
          'Content-Type': 'application/json'  
        }  
      });  
        
      console.log('Response status:', response.status);  
        
      if (response.ok) {  
        const data = await response.json();  
        console.log('Data received:', data);  
          
        // ✅ CORRECCIÓN: Acceder a data.formulario en lugar de data directamente  
        const formularioData = data.formulario || data;  
          
        setFormulario({  
          titulo: formularioData.titulo || '',  
          descripcion: formularioData.descripcion || '',  
          introduccion: formularioData.introduccion || '',  
          texto_final: formularioData.texto_final || '',  
          tipo: formularioData.tipo || 'Cuestionario',  
          estatus: formularioData.estatus || 'abierto',  
          fecha_inicio: formularioData.fecha_inicio ? formularioData.fecha_inicio.split('T')[0] : '',  
          fecha_fin: formularioData.fecha_fin ? formularioData.fecha_fin.split('T')[0] : '',  
          umbral_aprobacion: formularioData.umbral_aprobacion || 70,  
          tiempo_limite: formularioData.tiempo_limite || 45,  
          navegacion_preguntas: formularioData.navegacion_preguntas || true,  
          mostrar_respuestas: formularioData.mostrar_respuestas || true  
        });  
      } else {  
        const errorText = await response.text();  
        console.error('Error response:', errorText);  
        setError('Error al cargar el formulario');  
        setTimeout(() => navigate('/admin/formularios'), 2000);  
      }  
    } catch (error) {  
      console.error('Fetch error:', error);  
      setError('Error de conexión al cargar el formulario');  
      setTimeout(() => navigate('/admin/formularios'), 2000);  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  const handleSubmit = async (e) => {  
    e.preventDefault();  
    setSaving(true);  
    setError('');  
  
    try {  
      const token = localStorage.getItem('token');  
      const response = await fetch(`http://localhost:4000/admin/formularios/${codigo}`, {  
        method: 'PUT',  
        headers: {  
          'Authorization': `Bearer ${token}`,  
          'Content-Type': 'application/json'  
        },  
        body: JSON.stringify(formulario)  
      });  
  
      if (response.ok) {  
        alert('Formulario actualizado exitosamente');  
        navigate('/admin/formularios');  
      } else {  
        const errorData = await response.json();  
        setError(errorData.message || 'Error al actualizar el formulario');  
      }  
    } catch (error) {  
      console.error('Error updating formulario:', error);  
      setError('Error de conexión al actualizar el formulario');  
    } finally {  
      setSaving(false);  
    }  
  };  
  
  const handleChange = (e) => {  
    const { name, value, type, checked } = e.target;  
    setFormulario(prev => ({  
      ...prev,  
      [name]: type === 'checkbox' ? checked : value  
    }));  
  };  
  
  if (loading) {  
    return (  
      <div className="min-vh-100 d-flex flex-column bg-body-tertiary">  
        <Navbar rol={rol} nombre={nombre} />  
        <main className="flex-grow-1 container-xxl py-4">  
          <section className="section-card">  
            <div className="d-flex align-items-center gap-3">  
              <div className="spinner-border text-primary" role="status" />  
              <div className="text-body-secondary">Cargando formulario...</div>  
            </div>  
          </section>  
        </main>  
      </div>  
    );  
  }  
  
  return (  
    <div className="min-vh-100 d-flex flex-column bg-body-tertiary">  
      <Navbar rol={rol} nombre={nombre} />  
        
      {/* HERO */}  
      <header className="page-hero container-xxl">  
        <div className="page-hero__surface page-hero--accent">  
          <div className="d-flex align-items-center gap-3">  
            <span className="hero-icon bi bi-pencil-square"></span>  
            <div>  
              <h1 className="h3 mb-1">Editar Formulario</h1>  
              <p className="mb-0 text-body-secondary">  
                Código: {codigo}  
              </p>  
            </div>  
          </div>  
            
          <div className="d-flex align-items-center gap-2">  
            <button  
              type="button"  
              className="btn btn-outline-secondary"  
              onClick={() => navigate('/admin/formularios')}  
            >  
              <i className="bi bi-arrow-left me-2"></i> Volver  
            </button>  
          </div>  
        </div>  
      </header>  
  
      <main className="flex-grow-1 container-xxl py-4">  
        {error && (  
          <section className="section-card mb-4">  
            <div className="alert alert-danger mb-0">  
              <i className="bi bi-exclamation-triangle me-2"></i>  
              {error}  
            </div>  
          </section>  
        )}  
  
        <section className="section-card">  
          <form onSubmit={handleSubmit}>  
            <div className="row g-4">  
              <div className="col-12">  
                <label htmlFor="titulo" className="form-label">  
                  Título del Formulario <span className="text-danger">*</span>  
                </label>  
                <input  
                  type="text"  
                  id="titulo"  
                  name="titulo"  
                  className="form-control"  
                  value={formulario.titulo}  
                  onChange={handleChange}  
                  required  
                  placeholder="Ingresa el título del formulario"  
                />  
              </div>  
  
              <div className="col-12">  
                <label htmlFor="descripcion" className="form-label">  
                  Descripción  
                </label>  
                <textarea  
                  id="descripcion"  
                  name="descripcion"  
                  className="form-control"  
                  rows="3"  
                  value={formulario.descripcion}  
                  onChange={handleChange}  
                  placeholder="Describe el propósito del formulario"  
                />  
              </div>  
  
              <div className="col-12">  
                <label htmlFor="introduccion" className="form-label">  
                  Introducción  
                </label>  
                <textarea  
                  id="introduccion"  
                  name="introduccion"  
                  className="form-control"  
                  rows="3"  
                  value={formulario.introduccion}  
                  onChange={handleChange}  
                  placeholder="Texto introductorio para los participantes"  
                />  
              </div>  
  
              <div className="col-12">  
                <label htmlFor="texto_final" className="form-label">  
                  Texto Final  
                </label>  
                <textarea  
                  id="texto_final"  
                  name="texto_final"  
                  className="form-control"  
                  rows="3"  
                  value={formulario.texto_final}  
                  onChange={handleChange}  
                  placeholder="Mensaje de agradecimiento al finalizar"  
                />  
              </div>  
  
              <div className="col-md-6">  
                <label htmlFor="tipo" className="form-label">  
                  <i className="bi bi-ui-radios-grid me-1"></i>  
                  Tipo <span className="text-danger">*</span>  
                </label>  
                <select  
                  id="tipo"  
                  name="tipo"  
                  className="form-select"  
                  value={formulario.tipo}  
                  onChange={handleChange}  
                  required  
                >  
                  <option value="Encuesta">Encuesta</option>  
                  <option value="Cuestionario">Cuestionario</option>  
                </select>  
              </div>  
  
              <div className="col-md-6">  
                <label htmlFor="estatus" className="form-label">  
                  <i className="bi bi-unlock me-1"></i>  
                  Estado <span className="text-danger">*</span>  
                </label>  
                <select  
                  id="estatus"  
                  name="estatus"  
                  className="form-select"  
                  value={formulario.estatus}  
                  onChange={handleChange}  
                  required  
                >  
                  <option value="abierto">Abierto</option>  
                  <option value="cerrado">Cerrado</option>  
                </select>  
              </div>  
  
              <div className="col-md-6">  
                <label htmlFor="fecha_inicio" className="form-label">  
                  <i className="bi bi-calendar-event me-1"></i>  
                  Fecha de Inicio  
                </label>  
                <input  
                  type="date"  
                  id="fecha_inicio"  
                  name="fecha_inicio"  
                  className="form-control"  
                  value={formulario.fecha_inicio}  
                  onChange={handleChange}  
                />  
              </div>  
  
              <div className="col-md-6">  
                <label htmlFor="fecha_fin" className="form-label">  
                  <i className="bi bi-calendar-check me-1"></i>  
                  Fecha de Fin  
                </label>  
                <input  
                  type="date"  
                  id="fecha_fin"  
                  name="fecha_fin"  
                  className="form-control"  
                  value={formulario.fecha_fin}  
                  onChange={handleChange}  
                />  
              </div>  
  
              <div className="col-md-6">  
                <label htmlFor="umbral_aprobacion" className="form-label">  
                  <i className="bi bi-percent me-1"></i>  
                  Umbral de Aprobación (%)  
                </label>  
                <input  
                  type="number"  
                  id="umbral_aprobacion"  
                  name="umbral_aprobacion"  
                  className="form-control"  
                  value={formulario.umbral_aprobacion}  
                  onChange={handleChange}  
                  min="0"  
                  max="100"  
                />  
              </div>  
  
              <div className="col-md-6">  
                <label htmlFor="tiempo_limite" className="form-label">  
                  <i className="bi bi-clock me-1"></i>  
                  Tiempo Límite (minutos)  
                </label>  
                <input  
                  type="number"  
                  id="tiempo_limite"  
                  name="tiempo_limite"  
                  className="form-control"  
                  value={formulario.tiempo_limite}  
                  onChange={handleChange}  
                  min="1"  
                />  
              </div>  
  
              <div className="col-12">  
                <div className="row g-3">  
                  <div className="col-md-6">  
                    <div className="form-check">  
                      <input  
                        type="checkbox"  
                        id="navegacion_preguntas"  
                        name="navegacion_preguntas"  
                        className="form-check-input"  
                        checked={formulario.navegacion_preguntas}  
                        onChange={handleChange}  
                      />  
                      <label htmlFor="navegacion_preguntas" className="form-check-label">  
                        Permitir navegación entre preguntas  
                      </label>  
                    </div>  
                  </div>  
                  <div className="col-md-6">  
                    <div className="form-check">  
                      <input  
                        type="checkbox"  
                        id="mostrar_respuestas"  
                        name="mostrar_respuestas"  
                        className="form-check-input"  
                        checked={formulario.mostrar_respuestas}  
                        onChange={handleChange}  
                      />  
                      <label htmlFor="mostrar_respuestas" className="form-check-label">  
                        Mostrar respuestas al finalizar  
                      </label>  
                    </div>  
                  </div>  
                </div>  
              </div>  
  
              <div className="col-12">  
                <hr className="my-4" />  
                <div className="d-flex gap-3">  
                  <button  
                    type="submit"  
                    className="btn btn-primary"  
                    disabled={saving}  
                  >  
                    {saving ? (  
                      <>  
                        <span className="spinner-border spinner-border-sm me-2" role="status" />  
                        Guardando...  
                      </>  
                    ) : (  
                      <>  
                        <i className="bi bi-check-lg me-2"></i>  
                        Actualizar Formulario  
                      </>  
                    )}  
                  </button>  
                  <button  
                    type="button"  
                    className="btn btn-outline-secondary"  
                    onClick={() => navigate('/admin/formularios')}  
                    disabled={saving}  
                  >  
                    <i className="bi bi-x-lg me-2"></i>  
                    Cancelar  
                  </button>  
                </div>  
              </div>  
            </div>  
          </form>  
        </section>  
      </main>  
    </div>  
  );  
}