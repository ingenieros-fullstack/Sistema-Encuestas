import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Usuario from "./Usuario.js";
import Formulario from "./Formulario.js";

const Asignacion = sequelize.define(
  "Asignacion",
  {
    id_asignacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    codigo_formulario: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "en_progreso", "completado"),
      defaultValue: "pendiente",
    },
    intentos_realizados: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_respuesta: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "asignaciones",
    timestamps: false,
  }
);

// Relaciones
Asignacion.belongsTo(Usuario, { foreignKey: "id_usuario" });
Asignacion.belongsTo(Formulario, {
  foreignKey: "codigo_formulario",
  targetKey: "codigo",
});

export default Asignacion;
