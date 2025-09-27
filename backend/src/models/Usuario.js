import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import DataEmpleado from "./DataEmpleado.js";

const Usuario = sequelize.define("Usuario", {
  id_usuario: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  id_data: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  correo_electronico: { 
    type: DataTypes.STRING(100), 
    allowNull: false, 
    unique: true 
  },
  password: { 
    type: DataTypes.STRING(255), 
    allowNull: false 
  },
  rol: { 
    type: DataTypes.ENUM("admin", "supervisor", "empleado"), 
    allowNull: false, 
    defaultValue: "empleado" 
  },
  estatus: { 
    type: DataTypes.TINYINT, 
    defaultValue: 1 
  },
must_change_password: {   
  type: DataTypes.BOOLEAN,   
  defaultValue: true,   
  allowNull: false   
},
  created_at: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
}, {
  tableName: "usuarios",
  timestamps: false
});



// ✅ Relación con DataEmpleado usando alias "empleado"
Usuario.belongsTo(DataEmpleado, { foreignKey: "id_data", as: "empleado" });

export default Usuario;
