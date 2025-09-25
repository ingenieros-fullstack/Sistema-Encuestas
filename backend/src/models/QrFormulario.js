import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Formulario from "./Formulario.js";

const QrFormulario = sequelize.define("QrFormulario", {
  id_qr: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_formulario: { type: DataTypes.INTEGER, allowNull: false },
  url: { type: DataTypes.STRING(255), allowNull: false },
  codigo_qr: { type: DataTypes.TEXT, allowNull: false }
}, {
  tableName: "qr_formularios",
  timestamps: false
});

QrFormulario.belongsTo(Formulario, { foreignKey: "id_formulario" });

export default QrFormulario;
