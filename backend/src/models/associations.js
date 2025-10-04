import Pregunta from "./Pregunta.js";  
import Opcion from "./Opcion.js";  
  
// Establecer relaciones después de que ambos modelos estén definidos  
Pregunta.hasMany(Opcion, {   
  foreignKey: "id_pregunta",   
  as: "Opciones",  
  onDelete: "CASCADE"  
});  
  
Opcion.belongsTo(Pregunta, {   
  foreignKey: "id_pregunta",   
  as: "Pregunta"   
});  
  
export { Pregunta, Opcion };