import Formulario from "../models/Formulario.js";  
import Seccion from "../models/Seccion.js";  
import Pregunta from "../models/Pregunta.js";  
import Opcion from "../models/Opcion.js";  
import sequelize from "../config/db.js";  
  
// ======================================  
// Crear pregunta  
// ======================================  
export const crearPregunta = async (req, res) => {  
  const transaction = await sequelize.transaction();  
  try {  
    const { id_seccion, enunciado, tipo_pregunta, obligatoria, puntaje, opciones, respuesta_correcta } = req.body;  
      
    // Validaciones básicas  
    if (!id_seccion || !enunciado || !tipo_pregunta) {  
      await transaction.rollback();  
      return res.status(400).json({ message: "Faltan campos requeridos" });  
    }  
  
    // Validar que preguntas múltiples/únicas tengan opciones  
    const requiereOpciones = tipo_pregunta === 'opcion_multiple' || tipo_pregunta === 'seleccion_unica';  
    let opcionesArray = [];  
      
    if (requiereOpciones) {  
      if (typeof opciones === 'string') {  
        opcionesArray = opciones.split(';').map(s => s.trim()).filter(Boolean);  
      } else if (Array.isArray(opciones)) {  
        opcionesArray = opciones.map(s => String(s).trim()).filter(Boolean);  
      }  
        
      if (opcionesArray.length < 2) {  
        await transaction.rollback();  
        return res.status(400).json({ message: "Las preguntas múltiples/únicas requieren al menos 2 opciones" });  
      }  
    }  
  
    // Crear la pregunta  
    const nuevaPregunta = await Pregunta.create({  
      id_seccion: Number(id_seccion),  
      enunciado: enunciado.trim(),  
      tipo_pregunta,  
      obligatoria: !!obligatoria,  
      puntaje: Number(puntaje) || 0,  
      respuesta_correcta: respuesta_correcta || null  
    }, { transaction });  
  
    // Crear opciones si las hay  
    if (requiereOpciones && opcionesArray.length > 0) {  
      const opcionesRows = opcionesArray.map((texto) => ({  
        id_pregunta: nuevaPregunta.id_pregunta,  
        texto: texto  
      }));  
      await Opcion.bulkCreate(opcionesRows, { transaction });  
    }  
  
    await transaction.commit();  
    res.status(201).json({   
      message: "Pregunta creada exitosamente",  
      pregunta: nuevaPregunta   
    });  
  } catch (error) {  
    await transaction.rollback();  
    console.error('Error al crear pregunta:', error);  
    res.status(500).json({ message: error.message });  
  }  
};  
  
// ======================================  
// Actualizar pregunta  
// ======================================  
export const actualizarPregunta = async (req, res) => {  
  const transaction = await sequelize.transaction();  
  try {  
    const { id } = req.params;  
    const { enunciado, tipo_pregunta, obligatoria, puntaje, opciones, respuesta_correcta } = req.body;  
  
    const pregunta = await Pregunta.findByPk(id);  
    if (!pregunta) {  
      await transaction.rollback();  
      return res.status(404).json({ message: "Pregunta no encontrada" });  
    }  
  
    // Actualizar campos básicos  
    await pregunta.update({  
      enunciado: enunciado || pregunta.enunciado,  
      tipo_pregunta: tipo_pregunta || pregunta.tipo_pregunta,  
      obligatoria: obligatoria !== undefined ? !!obligatoria : pregunta.obligatoria,  
      puntaje: puntaje !== undefined ? Number(puntaje) : pregunta.puntaje,  
      respuesta_correcta: respuesta_correcta !== undefined ? respuesta_correcta : pregunta.respuesta_correcta  
    }, { transaction });  
  
    // Manejar opciones si es pregunta múltiple/única  
    const requiereOpciones = tipo_pregunta === 'opcion_multiple' || tipo_pregunta === 'seleccion_unica';  
      
    if (requiereOpciones && opciones !== undefined) {  
      let opcionesArray = [];  
        
      if (typeof opciones === 'string') {  
        opcionesArray = opciones.split(';').map(s => s.trim()).filter(Boolean);  
      } else if (Array.isArray(opciones)) {  
        opcionesArray = opciones.map(s => String(s).trim()).filter(Boolean);  
      }  
  
      // Eliminar opciones existentes  
      await Opcion.destroy({   
        where: { id_pregunta: pregunta.id_pregunta },  
        transaction   
      });  
  
      // Crear nuevas opciones  
      if (opcionesArray.length > 0) {  
        const opcionesRows = opcionesArray.map((texto) => ({  
          id_pregunta: pregunta.id_pregunta,  
          texto: texto  
        }));  
        await Opcion.bulkCreate(opcionesRows, { transaction });  
      }  
    }  
  
    await transaction.commit();  
    res.json({   
      message: "Pregunta actualizada exitosamente",  
      pregunta   
    });  
  } catch (error) {  
    await transaction.rollback();  
    console.error('Error al actualizar pregunta:', error);  
    res.status(500).json({ message: error.message });  
  }  
};  
  
// ======================================  
// Eliminar pregunta  
// ======================================  
export const eliminarPregunta = async (req, res) => {  
  try {  
    const { id } = req.params;  
      
    const pregunta = await Pregunta.findByPk(id);  
    if (!pregunta) {  
      return res.status(404).json({ message: "Pregunta no encontrada" });  
    }  
  
    // Las opciones se eliminan automáticamente por CASCADE  
    await pregunta.destroy();  
    res.json({ message: "Pregunta eliminada exitosamente" });  
  } catch (error) {  
    console.error('Error al eliminar pregunta:', error);  
    res.status(500).json({ message: error.message });  
  }  
};