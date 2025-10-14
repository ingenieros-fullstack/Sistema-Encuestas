import { DataTypes } from "sequelize";  
import sequelize from "../config/db.js";  
  
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
    type: DataTypes.STRING(100)   
  }  
}, {  
  tableName: "opciones",  
  timestamps: false  
});  
  
export default Opcion;