import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Empresa = sequelize.define("Empresa", {
  id_empresa: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  direccion: { type: DataTypes.STRING(200) },
  contacto: { type: DataTypes.STRING(100) },
  telefono: { type: DataTypes.STRING(20) },
  correo_electronico: { type: DataTypes.STRING(100) },
  logo: { type: DataTypes.STRING(200) },
  rfc: { type: DataTypes.STRING(20) },
  registro_patronal: { type: DataTypes.STRING(50) },
  representante_legal: { type: DataTypes.STRING(100) },
  actividad_economica: { type: DataTypes.STRING(100) }
}, {
  tableName: "empresas",
  timestamps: false
});

export default Empresa;
