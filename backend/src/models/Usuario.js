import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Empresa from "./Empresa.js";

const Usuario = sequelize.define("Usuario", {
  id_usuario: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_empresa: { type: DataTypes.INTEGER, allowNull: false },
  numero_empleado: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido_paterno: { type: DataTypes.STRING(100) },
  apellido_materno: { type: DataTypes.STRING(100) },
  sexo: { type: DataTypes.ENUM("M","F","O") },
  fecha_nacimiento: { type: DataTypes.DATE },
  fecha_ingreso: { type: DataTypes.DATE },
  correo_electronico: { type: DataTypes.STRING(100), allowNull: false },
  centro_trabajo: { type: DataTypes.STRING(100) },
  departamento: { type: DataTypes.STRING(100) },
  grado_estudios: { type: DataTypes.STRING(50) },
  turno: { type: DataTypes.STRING(20) },
  supervisor: { type: DataTypes.STRING(100) },
  password: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.ENUM("admin","supervisor","empleado"), allowNull: false },
  estatus: { type: DataTypes.TINYINT, defaultValue: 1 },
  telefono: { type: DataTypes.STRING(20) },
  foto: { type: DataTypes.STRING(200) }
}, {
  tableName: "usuarios",
  timestamps: false
});

// Relación con empresa
Usuario.belongsTo(Empresa, { foreignKey: "id_empresa" });

export default Usuario;
