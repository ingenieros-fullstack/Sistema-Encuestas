import { DataTypes } from "sequelize";  
import sequelize from "../config/db.js";  
  
const Pregunta = sequelize.define("Pregunta", {  
  id_pregunta: {   
    type: DataTypes.INTEGER,   
    autoIncrement: true,   
    primaryKey: true   
  },  
  id_seccion: {   
    type: DataTypes.INTEGER,   
    allowNull: false   
  },  
  enunciado: {   
    type: DataTypes.TEXT,  // Cambiado a TEXT para permitir preguntas más largas  
    allowNull: false   
  },  
  tipo_pregunta: {  
    type: DataTypes.ENUM(  
      "respuesta_corta",   
      "opcion_multiple",   
      "seleccion_unica",   
      "si_no",   
      "escala_1_5",  
      "condicional"   // Mantenido el nuevo tipo  
    ),  
    allowNull: false  
  },  
  obligatoria: {   
    type: DataTypes.BOOLEAN,   
    defaultValue: false   
  },  
  puntaje: {   
    type: DataTypes.INTEGER,   
    defaultValue: 0   
  },  
  respuesta_correcta: {   
    type: DataTypes.TEXT,   
    allowNull: true   
  },  
}, {  
  tableName: "preguntas",  
  timestamps: true,  
  createdAt: "created_at",  
  updatedAt: "updated_at"  // ✅ Habilitado para evitar errores de Sequelize  
});  
  
export default Pregunta;