import { DataTypes } from "sequelize";  
import sequelize from "../config/db.js";  
  
const Respuesta = sequelize.define("Respuesta", {  
  id_respuesta: {   
    type: DataTypes.INTEGER,   
    autoIncrement: true,   
    primaryKey: true   
  },  
  id_asignacion: {   
    type: DataTypes.INTEGER,   
    allowNull: false   
  },  
  id_pregunta: {   
    type: DataTypes.INTEGER,   
    allowNull: false   
  },  
  respuesta: {   
    type: DataTypes.TEXT,   
    allowNull: false   
  },  
  es_correcta: {   
    type: DataTypes.TINYINT   
  },  
  puntaje_obtenido: {   
    type: DataTypes.INTEGER   
  }  
}, {  
  tableName: "respuestas",  
  timestamps: false  
});  
  
export default Respuesta;