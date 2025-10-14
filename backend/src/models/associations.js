import Pregunta from "./Pregunta.js";  
import Opcion from "./Opcion.js";  
import Respuesta from "./Respuesta.js";  
  
// Relación Pregunta -> Opciones  
Pregunta.hasMany(Opcion, {  
  foreignKey: "id_pregunta",  
  as: "Opciones",  
  onDelete: "CASCADE"  
});  
  
Opcion.belongsTo(Pregunta, {  
  foreignKey: "id_pregunta",  
  as: "Pregunta"  
});  
  
// Relación Respuesta -> Pregunta  
Respuesta.belongsTo(Pregunta, {  
  foreignKey: "id_pregunta",  
  as: "Pregunta"  
});  
  
Pregunta.hasMany(Respuesta, {  
  foreignKey: "id_pregunta",  
  as: "Respuestas"  
});  
  
export { Pregunta, Opcion, Respuesta };