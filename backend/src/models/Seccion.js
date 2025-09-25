import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Formulario from "./Formulario.js";

const Seccion = sequelize.define("Seccion", {
  id_seccion: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_formulario: { type: DataTypes.INTEGER, allowNull: false },
  tema: { type: DataTypes.STRING(150) },
  nombre_seccion: { type: DataTypes.STRING(150) }
}, {
  tableName: "secciones",
  timestamps: false
});

Seccion.belongsTo(Formulario, { foreignKey: "id_formulario" });

export default Seccion;
