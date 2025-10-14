import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Formulario from "./Formulario.js";

const QrFormulario = sequelize.define("QrFormulario", {
  id_qr: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  codigo_formulario: { type: DataTypes.STRING(50), allowNull: false },
  url: { type: DataTypes.STRING(255), allowNull: false },
  codigo_qr: { type: DataTypes.TEXT, allowNull: false }
}, {
  tableName: "qr_formularios",
  timestamps: true,
  createdAt: "fecha_generacion",
  updatedAt: false
});

QrFormulario.belongsTo(Formulario, { foreignKey: "codigo_formulario", targetKey: "codigo" });

export default QrFormulario;
