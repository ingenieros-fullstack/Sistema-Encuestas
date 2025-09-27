import { DataTypes } from "sequelize";  
import sequelize from "../config/db.js";  
import Empresa from "./Empresa.js";  
  
const Formulario = sequelize.define("Formulario", {  
  codigo: {   
    type: DataTypes.STRING(50),   
    primaryKey: true,  
    allowNull: false  
  },  
  id_empresa: { type: DataTypes.INTEGER, allowNull: false },  
  tipo: { type: DataTypes.ENUM("Encuesta","Cuestionario"), allowNull: false },  
  titulo: { type: DataTypes.STRING(150), allowNull: false },  
  descripcion: { type: DataTypes.TEXT },  
  introduccion: { type: DataTypes.TEXT },  
  texto_final: { type: DataTypes.TEXT },  
  fecha_inicio: { type: DataTypes.DATE },  
  fecha_fin: { type: DataTypes.DATE },  
  estatus: { type: DataTypes.ENUM("abierto","cerrado"), defaultValue: "abierto" },  
  umbral_aprobacion: { type: DataTypes.INTEGER },  
  tiempo_limite: { type: DataTypes.INTEGER },  
  navegacion_preguntas: { type: DataTypes.BOOLEAN, defaultValue: false },  
  mostrar_respuestas: { type: DataTypes.BOOLEAN, defaultValue: false }  
}, {  
  tableName: "formularios",  
  timestamps: true,  
  createdAt: 'created_at',  
  updatedAt: false  
});  
  
Formulario.belongsTo(Empresa, { foreignKey: "id_empresa" });  
  
export default Formulario;
