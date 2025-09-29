import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Formulario from "./Formulario.js";
import Pregunta from "./Pregunta.js";

const Seccion = sequelize.define("Seccion", {
  id_seccion: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  codigo_formulario: { type: DataTypes.STRING(50), allowNull: false },
  nombre_seccion: { type: DataTypes.STRING(150), allowNull: false },
  tema: { type: DataTypes.STRING(150) },
}, {
  tableName: "secciones",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

// 🔗 Relaciones
Formulario.hasMany(Seccion, { foreignKey: "codigo_formulario", sourceKey: "codigo", as: "Secciones" });
Seccion.belongsTo(Formulario, { foreignKey: "codigo_formulario", targetKey: "codigo", as: "Formulario" });

Seccion.hasMany(Pregunta, { foreignKey: "id_seccion", as: "Preguntas" });
Pregunta.belongsTo(Seccion, { foreignKey: "id_seccion", as: "Seccion" });

export default Seccion;
