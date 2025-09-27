import Formulario from "../models/Formulario.js";  
import { Op } from "sequelize";  
  
// Crear formulario  
export const crearFormulario = async (req, res) => {  
  try {  
    const { titulo, descripcion, tipo, fecha_inicio, fecha_fin, ...configEspecifica } = req.body;  
      
    // Generar código único automáticamente  
    const timestamp = Date.now();  
    const tipoPrefix = tipo === 'Encuesta' ? 'ENC' : 'CUEST';  
    const codigo = `${tipoPrefix}-${timestamp}`;  
      
    // Validaciones básicas  
    if (!titulo || titulo.trim().length < 3) {  
      return res.status(400).json({   
        message: "El título es requerido y debe tener al menos 3 caracteres"   
      });  
    }  
  
    if (!['Encuesta', 'Cuestionario'].includes(tipo)) {  
      return res.status(400).json({   
        message: "El tipo debe ser: Encuesta o Cuestionario"   
      });  
    }  
  
    // Crear formulario con código generado  
    const nuevoFormulario = await Formulario.create({  
      codigo,  
      id_empresa: 1, // Por defecto empresa demo  
      tipo,  
      titulo: titulo.trim(),  
      descripcion: descripcion?.trim() || null,  
      fecha_inicio: fecha_inicio || null,  
      fecha_fin: fecha_fin || null,  
      ...configEspecifica  
    });  
  
    res.status(201).json({  
      message: "Formulario creado exitosamente",  
      formulario: nuevoFormulario  
    });  
  
  } catch (error) {  
    console.error("Error al crear formulario:", error);  
    res.status(500).json({  
      message: "Error al crear formulario",  
      error: error.message  
    });  
  }  
};  
  
// Listar formularios con filtros y paginación  
export const listarFormularios = async (req, res) => {  
  try {  
    const { page = 1, limit = 10, tipo, estatus, search } = req.query;  
    const offset = (page - 1) * limit;  
  
    // Construir filtros  
    const whereClause = {};  
      
    if (tipo && ['Encuesta', 'Cuestionario'].includes(tipo)) {  
      whereClause.tipo = tipo;  
    }  
      
    if (estatus && ['abierto', 'cerrado'].includes(estatus)) {  
      whereClause.estatus = estatus;  
    }  
      
    if (search) {  
      whereClause[Op.or] = [  
        { titulo: { [Op.like]: `%${search}%` } },  
        { descripcion: { [Op.like]: `%${search}%` } }  
      ];  
    }  
  
    const { count, rows } = await Formulario.findAndCountAll({  
      where: whereClause,  
      limit: parseInt(limit),  
      offset: parseInt(offset),  
      order: [['created_at', 'DESC']]  
    });  
  
    res.json({  
      formularios: rows,  
      total: count,  
      page: parseInt(page),  
      totalPages: Math.ceil(count / limit)  
    });  
  
  } catch (error) {  
    console.error("Error al listar formularios:", error);  
    res.status(500).json({  
      message: "Error al obtener formularios",  
      error: error.message  
    });  
  }  
};  
  
// Obtener formulario específico  
export const obtenerFormulario = async (req, res) => {  
  try {  
    const { codigo } = req.params;  
      
    const formulario = await Formulario.findByPk(codigo);  
      
    if (!formulario) {  
      return res.status(404).json({  
        message: "Formulario no encontrado"  
      });  
    }  
  
    res.json({  
      formulario  
    });  
  
  } catch (error) {  
    console.error("Error al obtener formulario:", error);  
    res.status(500).json({  
      message: "Error al obtener formulario",  
      error: error.message  
    });  
  }  
};  
  
// Actualizar formulario  
export const actualizarFormulario = async (req, res) => {  
  try {  
    const { codigo } = req.params;  
    const { titulo, descripcion, tipo, fecha_inicio, fecha_fin, estatus, ...configEspecifica } = req.body;  
  
    const formulario = await Formulario.findByPk(codigo);  
      
    if (!formulario) {  
      return res.status(404).json({  
        message: "Formulario no encontrado"  
      });  
    }  
  
    // Validaciones  
    if (titulo && titulo.trim().length < 3) {  
      return res.status(400).json({   
        message: "El título debe tener al menos 3 caracteres"   
      });  
    }  
  
    if (tipo && !['Encuesta', 'Cuestionario'].includes(tipo)) {  
      return res.status(400).json({   
        message: "El tipo debe ser: Encuesta o Cuestionario"   
      });  
    }  
  
    if (estatus && !['abierto', 'cerrado'].includes(estatus)) {  
      return res.status(400).json({   
        message: "El estatus debe ser: abierto o cerrado"   
      });  
    }  
  
    // Actualizar campos  
    const datosActualizacion = {};  
    if (titulo) datosActualizacion.titulo = titulo.trim();  
    if (descripcion !== undefined) datosActualizacion.descripcion = descripcion?.trim() || null;  
    if (tipo) datosActualizacion.tipo = tipo;  
    if (fecha_inicio !== undefined) datosActualizacion.fecha_inicio = fecha_inicio || null;  
    if (fecha_fin !== undefined) datosActualizacion.fecha_fin = fecha_fin || null;  
    if (estatus) datosActualizacion.estatus = estatus;  
      
    // Agregar configuración específica  
    Object.assign(datosActualizacion, configEspecifica);  
  
    await formulario.update(datosActualizacion);  
  
    res.json({  
      message: "Formulario actualizado exitosamente",  
      formulario  
    });  
  
  } catch (error) {  
    console.error("Error al actualizar formulario:", error);  
    res.status(500).json({  
      message: "Error al actualizar formulario",  
      error: error.message  
    });  
  }  
};  
  
// Eliminar formulario  
export const eliminarFormulario = async (req, res) => {  
  try {  
    const { codigo } = req.params;  
      
    const formulario = await Formulario.findByPk(codigo);  
      
    if (!formulario) {  
      return res.status(404).json({  
        message: "Formulario no encontrado"  
      });  
    }  
  
    await formulario.destroy();  
  
    res.json({  
      message: "Formulario eliminado exitosamente"  
    });  
  
  } catch (error) {  
    console.error("Error al eliminar formulario:", error);  
    res.status(500).json({  
      message: "Error al eliminar formulario",  
      error: error.message  
    });  
  }  
};