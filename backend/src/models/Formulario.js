import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Empresa from "./Empresa.js";

const Formulario = sequelize.define("Formulario", {
  id_formulario: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_empresa: { type: DataTypes.INTEGER, allowNull: false },
  codigo: { type: DataTypes.STRING(50), unique: true },
  tipo: { type: DataTypes.ENUM("nom035","general","cuestionario"), allowNull: false },
  titulo: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  introduccion: { type: DataTypes.TEXT },
  texto_final: { type: DataTypes.TEXT },
  periodo: { type: DataTypes.INTEGER },
  fecha_inicio: { type: DataTypes.DATE },
  fecha_fin: { type: DataTypes.DATE },
  estatus: { type: DataTypes.ENUM("abierta","cerrada","en_proceso"), defaultValue: "en_proceso" },
  umbral_aprobacion: { type: DataTypes.INTEGER }
}, {
  tableName: "formularios",
  timestamps: false
});

Formulario.belongsTo(Empresa, { foreignKey: "id_empresa" });

export default Formulario;
