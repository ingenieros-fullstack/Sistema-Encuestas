import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Seccion from "./Seccion.js";

const Pregunta = sequelize.define("Pregunta", {
  id_pregunta: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_seccion: { type: DataTypes.INTEGER, allowNull: false },
  numero_pregunta: { type: DataTypes.INTEGER },
  enunciado: { type: DataTypes.TEXT, allowNull: false },
  tipo_pregunta: { type: DataTypes.ENUM("respuesta_corta","opcion_multiple","seleccion_unica","si_no","escala_1_5"), allowNull: false },
  obligatoria: { type: DataTypes.TINYINT, defaultValue: 0 },
  puntaje: { type: DataTypes.INTEGER },
  respuesta_correcta: { type: DataTypes.TEXT }
}, {
  tableName: "preguntas",
  timestamps: false
});

Pregunta.belongsTo(Seccion, { foreignKey: "id_seccion" });

export default Pregunta;
