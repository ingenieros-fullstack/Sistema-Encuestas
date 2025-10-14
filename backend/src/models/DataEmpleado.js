import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Empresa from "./Empresa.js";

const DataEmpleado = sequelize.define("DataEmpleado", {
  id_data: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },

  id_empresa: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },

  // 📋 Datos personales
  nombre: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  apellido_paterno: { type: DataTypes.STRING(100) },
  apellido_materno: { type: DataTypes.STRING(100) },
  sexo: { type: DataTypes.ENUM("M", "F", "O") },
  fecha_nacimiento: { type: DataTypes.DATE },
  fecha_ingreso: { type: DataTypes.DATE },
  edad: { type: DataTypes.INTEGER },
  antiguedad: { type: DataTypes.INTEGER },

  // 🏢 Información laboral
  centro_trabajo: { type: DataTypes.STRING(100) },
  cc: { type: DataTypes.STRING(50) },
  cc_descrip: { type: DataTypes.STRING(150) },
  departamento: { type: DataTypes.STRING(100) },
  depto_descrip: { type: DataTypes.STRING(150) },
  turno: { type: DataTypes.STRING(20) },
  supervisor: { type: DataTypes.STRING(100) },

  // 🎓 Otros datos
  grado_estudios: { type: DataTypes.STRING(50) },
  telefono: { type: DataTypes.STRING(20) },
  foto: { type: DataTypes.STRING(200) },

  // 📧 Correo institucional
  correo_electronico: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  }
}, {
  tableName: "data_empleados",
  timestamps: false
});

// ✅ Relación con empresa
DataEmpleado.belongsTo(Empresa, { foreignKey: "id_empresa", as: "empresa" });

export default DataEmpleado;
