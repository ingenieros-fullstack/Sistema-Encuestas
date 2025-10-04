import { DataTypes } from "sequelize";  
import sequelize from "../config/db.js";  
import Pregunta from "./Pregunta.js";  
  
const Opcion = sequelize.define("Opcion", {  
  id_opcion: {   
    type: DataTypes.INTEGER,   
    autoIncrement: true,   
    primaryKey: true   
  },  
  id_pregunta: {   
    type: DataTypes.INTEGER,   
    allowNull: false   
  },  
  texto: {   
    type: DataTypes.STRING(255),   
    allowNull: false   
  },  
  valor: {   
    type: DataTypes.STRING(100),  
    allowNull: true  
  }  
}, {  
  tableName: "opciones",  
  timestamps: false  
});  
  
// Relaciones  
Pregunta.hasMany(Opcion, { foreignKey: "id_pregunta", as: "Opciones" });  
Opcion.belongsTo(Pregunta, { foreignKey: "id_pregunta", as: "Pregunta" });  
  
export default Opcion;