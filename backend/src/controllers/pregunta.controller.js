import Pregunta from "../models/Pregunta.js";  
import Opcion from "../models/Opcion.js";  
import sequelize from "../config/db.js";  
  
// Helper para convertir string "a;b;c" a array  
const parseOptions = (txt) =>  
  (txt || "").split(";").map((s) => s.trim()).filter(Boolean);  
  
/** ================== CREAR PREGUNTA ================== */  
export const crearPregunta = async (req, res) => {  
  const transaction = await sequelize.transaction();  
  try {  
    const {  
      id_seccion,  
      enunciado,  
      tipo_pregunta,  
      obligatoria,  
      respuesta_correcta,  
      puntaje,  
      opciones,  
    } = req.body;  
  
    // Validaciones básicas  
    if (!id_seccion || !enunciado || !tipo_pregunta) {  
      await transaction.rollback();  
      return res.status(400).json({ error: "Faltan campos requeridos" });  
    }  
  
    // Crear la pregunta base  
    const pregunta = await Pregunta.create({  
      id_seccion,  
      enunciado,  
      tipo_pregunta,  
      obligatoria: obligatoria ?? false,  
      respuesta_correcta,  
      puntaje: puntaje ?? 0,  
    }, { transaction });  
  
    // Si hay opciones, convertir de string a array y guardarlas  
    if (opciones) {  
      const opcionesArray = typeof opciones === 'string'   
        ? parseOptions(opciones)   
        : opciones;  
  
      if (opcionesArray.length > 0) {  
        const opcionesRows = opcionesArray.map((texto) => ({  
          id_pregunta: pregunta.id_pregunta,  
          texto,  
        }));  
        await Opcion.bulkCreate(opcionesRows, { transaction });  
      }  
    }  
  
    await transaction.commit();  
    res.json({ pregunta });  
  } catch (err) {  
    await transaction.rollback();  
    console.error("❌ Error crearPregunta:", err);  
    res.status(500).json({ error: err.message });  
  }  
};  
  
/** ================== ACTUALIZAR PREGUNTA ================== */  
export const actualizarPregunta = async (req, res) => {  
  const transaction = await sequelize.transaction();  
  try {  
    const { id } = req.params;  
    const {  
      enunciado,  
      tipo_pregunta,  
      obligatoria,  
      puntaje,  
      respuesta_correcta,  
      opciones,  
    } = req.body;  
  
    const pregunta = await Pregunta.findByPk(id);  
    if (!pregunta) {  
      await transaction.rollback();  
      return res.status(404).json({ error: "Pregunta no encontrada" });  
    }  
  
    // Actualizar campos principales  
    pregunta.enunciado = enunciado ?? pregunta.enunciado;  
    pregunta.tipo_pregunta = tipo_pregunta ?? pregunta.tipo_pregunta;  
    pregunta.obligatoria = obligatoria ?? pregunta.obligatoria;  
    pregunta.puntaje = puntaje ?? pregunta.puntaje;  
    pregunta.respuesta_correcta = respuesta_correcta ?? pregunta.respuesta_correcta;  
  
    await pregunta.save({ transaction });  
  
    // Actualizar opciones si se proporcionan  
    if (opciones !== undefined) {  
      // Primero eliminamos las opciones viejas  
      await Opcion.destroy({   
        where: { id_pregunta: pregunta.id_pregunta },  
        transaction   
      });  
  
      // Convertir de string a array si es necesario  
      const opcionesArray = typeof opciones === 'string'   
        ? parseOptions(opciones)   
        : opciones;  
  
      // Insertamos las nuevas  
      if (opcionesArray && opcionesArray.length > 0) {  
        const opcionesRows = opcionesArray.map((texto) => ({  
          id_pregunta: pregunta.id_pregunta,  
          texto,  
        }));  
        await Opcion.bulkCreate(opcionesRows, { transaction });  
      }  
    }  
  
    await transaction.commit();  
    return res.json({ message: "Pregunta actualizada", pregunta });  
  } catch (err) {  
    await transaction.rollback();  
    console.error("❌ Error actualizarPregunta:", err);  
    return res.status(500).json({ error: err.message });  
  }  
};  
  
/** ================== ELIMINAR PREGUNTA ================== */  
export const eliminarPregunta = async (req, res) => {  
  try {  
    const { id } = req.params;  
    const pregunta = await Pregunta.findByPk(id);  
    if (!pregunta) return res.status(404).json({ error: "Pregunta no encontrada" });  
  
    // Las opciones se eliminan automáticamente por CASCADE  
    await pregunta.destroy();  
    res.json({ message: "Pregunta eliminada" });  
  } catch (err) {  
    console.error("❌ Error eliminarPregunta:", err);  
    res.status(500).json({ error: err.message });  
  }  
};