import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Empresa from "./Empresa.js";

const DataEmpleado = sequelize.define("DataEmpleado", {
  id_data: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_empresa: { type: DataTypes.INTEGER, allowNull: false },
  numero_empleado: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido_paterno: { type: DataTypes.STRING(100) },
  apellido_materno: { type: DataTypes.STRING(100) },
  sexo: { type: DataTypes.ENUM("M", "F", "O") },
  fecha_nacimiento: { type: DataTypes.DATE },
  fecha_ingreso: { type: DataTypes.DATE },
  centro_trabajo: { type: DataTypes.STRING(100) },
  departamento: { type: DataTypes.STRING(100) },
  grado_estudios: { type: DataTypes.STRING(50) },
  turno: { type: DataTypes.STRING(20) },
  supervisor: { type: DataTypes.STRING(100) },
  telefono: { type: DataTypes.STRING(20) },
  foto: { type: DataTypes.STRING(200) },
  correo_electronico: { type: DataTypes.STRING(100), allowNull: false }
}, {
  tableName: "data_empleados",
  timestamps: false
});

// ✅ Relación con empresa
DataEmpleado.belongsTo(Empresa, { foreignKey: "id_empresa", as: "empresa" });

// ❌ NO importamos Usuario aquí → evitamos ciclos
// (si más adelante quieres la relación inversa, la defines en un `models/index.js` central)

export default DataEmpleado;
