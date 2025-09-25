import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Usuario from "./Usuario.js";
import Formulario from "./Formulario.js";

const Asignacion = sequelize.define("Asignacion", {
  id_asignacion: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  id_formulario: { type: DataTypes.INTEGER, allowNull: false },
  estado: { type: DataTypes.ENUM("pendiente","en_progreso","completado"), defaultValue: "pendiente" },
  intentos_realizados: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: "asignaciones",
  timestamps: false
});

Asignacion.belongsTo(Usuario, { foreignKey: "id_usuario" });
Asignacion.belongsTo(Formulario, { foreignKey: "id_formulario" });

export default Asignacion;
