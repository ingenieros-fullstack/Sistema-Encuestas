export default function CuestionarioConfig({ formData, handleInputChange }) {  
  return (  
    <div className="bg-green-50 p-4 rounded-lg">  
      <h3 className="text-lg font-semibold mb-3 text-green-800">  
        Configuración de Cuestionario  
      </h3>  
        
      <div className="space-y-3">  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-1">  
            Introducción  
          </label>  
          <textarea  
            name="introduccion"  
            value={formData.introduccion}  
            onChange={handleInputChange}  
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"  
            rows="3"  
            placeholder="Instrucciones para el cuestionario..."  
          />  
        </div>  
  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-1">  
            Texto Final  
          </label>  
          <textarea  
            name="texto_final"  
            value={formData.texto_final}  
            onChange={handleInputChange}  
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"  
            rows="3"  
            placeholder="Mensaje al completar el cuestionario..."  
          />  
        </div>  
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
          <div>  
            <label className="block text-sm font-medium text-gray-700 mb-1">  
              Tiempo Límite (minutos)  
            </label>  
            <input  
              type="number"  
              name="tiempo_limite"  
              value={formData.tiempo_limite}  
              onChange={handleInputChange}  
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"  
              placeholder="0 = Sin límite"  
              min="0"  
            />  
          </div>  
  
          <div>  
            <label className="block text-sm font-medium text-gray-700 mb-1">  
              Umbral de Aprobación (%)  
            </label>  
            <input  
              type="number"  
              name="umbral_aprobacion"  
              value={formData.umbral_aprobacion}  
              onChange={handleInputChange}  
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"  
              placeholder="80"  
              min="0"  
              max="100"  
            />  
          </div>  
        </div>  
  
        <div className="space-y-2">  
          <div className="flex items-center">  
            <input  
              type="checkbox"  
              name="navegacion_preguntas"  
              checked={formData.navegacion_preguntas}  
              onChange={handleInputChange}  
              className="mr-2"  
            />  
            <label className="text-sm text-gray-700">  
              Permitir navegación entre preguntas  
            </label>  
          </div>  
  
          <div className="flex items-center">  
            <input  
              type="checkbox"  
              name="mostrar_respuestas"  
              checked={formData.mostrar_respuestas}  
              onChange={handleInputChange}  
              className="mr-2"  
            />  
            <label className="text-sm text-gray-700">  
              Mostrar respuestas correctas al finalizar  
            </label>  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
}
