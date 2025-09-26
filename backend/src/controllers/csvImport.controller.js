import multer from "multer";
import csv from "csv-parser";
import iconv from "iconv-lite";
import xlsx from "xlsx";
import { Readable } from "stream";
import chardet from "chardet";
import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";
import Empresa from "../models/Empresa.js";
import DataEmpleado from "../models/DataEmpleado.js";
import sequelize from "../config/db.js";

// === Multer en memoria (no guarda archivos) ===
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = [".csv", ".xlsx", ".xls"];
    const ext = file.originalname.toLowerCase();
    allowed.some((t) => ext.includes(t))
      ? cb(null, true)
      : cb(new Error("Solo se permiten archivos CSV y Excel"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// === Detectar separador CSV ===
const detectSeparator = (firstLine) => {
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  return semicolons > commas ? ";" : ",";
};

// === Validar datos de empleado ===
const validateUserData = (userData, lineNumber) => {
  const errors = [];
  if (!userData.numero_empleado)
    errors.push(`Línea ${lineNumber}: Número de empleado es requerido`);
  if (!userData.nombre)
    errors.push(`Línea ${lineNumber}: Nombre es requerido`);
  if (!userData.correo_electronico)
    errors.push(`Línea ${lineNumber}: Correo electrónico es requerido`);
  if (userData.sexo && !["M", "F", "O"].includes(userData.sexo)) {
    errors.push(`Línea ${lineNumber}: Sexo debe ser M, F o O`);
  }
  if (
    userData.rol &&
    !["supervisor", "empleado"].includes(userData.rol) // 🚫 "admin" no se permite
  ) {
    errors.push(
      `Línea ${lineNumber}: Rol inválido. Solo se permite supervisor o empleado`
    );
  }
  return errors;
};

// === Parsear CSV desde buffer ===
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    try {
      const enc = chardet.detect(buffer) || "UTF-8";
      const text = iconv.decode(buffer, enc);
      const [firstLine = ""] = text.split(/\r?\n/);
      const separator = detectSeparator(firstLine);

      const utf8Stream = Readable.from(iconv.encode(text, "UTF-8"));
      const results = [];

      utf8Stream
        .pipe(csv({ separator }))
        .on("data", (row) => results.push(row))
        .on("end", () => resolve(results))
        .on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

// === Parsear Excel desde buffer ===
const parseExcel = (buffer) => {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet);
};

// === Importar usuarios ===
export const importUsers = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No se ha subido ningún archivo" });
    }

    const isCSV = req.file.originalname.toLowerCase().includes(".csv");
    const userData = isCSV
      ? await parseCSV(req.file.buffer)
      : parseExcel(req.file.buffer);

    if (!userData || userData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El archivo está vacío o no tiene el formato correcto",
      });
    }

    const defaultEmpresa = await Empresa.findByPk(1);
    if (!defaultEmpresa) {
      return res
        .status(400)
        .json({ success: false, message: "No se encontró empresa por defecto" });
    }

    const validationErrors = [];
    const usersImported = [];

    for (let i = 0; i < userData.length; i++) {
      const user = userData[i];
      const lineNumber = i + 2;

      // Validar campos obligatorios
      const errors = validateUserData(user, lineNumber);
      if (errors.length) {
        validationErrors.push(...errors);
        continue;
      }

      try {
        // Verificar duplicados antes de insertar
        const existsEmpleado = await DataEmpleado.findOne({
          where: { numero_empleado: user.numero_empleado },
        });
        if (existsEmpleado) {
          validationErrors.push(
            `Línea ${lineNumber}: El número de empleado ${user.numero_empleado} ya existe (omitido)`
          );
          continue;
        }

        const existsUsuario = await Usuario.findOne({
          where: { correo_electronico: user.correo_electronico },
        });
        if (existsUsuario) {
          validationErrors.push(
            `Línea ${lineNumber}: El correo ${user.correo_electronico} ya existe (omitido)`
          );
          continue;
        }

        // === Crear empleado (trigger creará usuario automáticamente con SHA2)
        const empleado = await DataEmpleado.create(
          {
            id_empresa: defaultEmpresa.id_empresa,
            numero_empleado: user.numero_empleado,
            nombre: user.nombre,
            apellido_paterno: user.apellido_paterno || null,
            apellido_materno: user.apellido_materno || null,
            sexo: user.sexo || null,
            fecha_nacimiento: user.fecha_nacimiento
              ? new Date(user.fecha_nacimiento)
              : null,
            fecha_ingreso: user.fecha_ingreso
              ? new Date(user.fecha_ingreso)
              : null,
            correo_electronico: user.correo_electronico,
            centro_trabajo: user.centro_trabajo || null,
            departamento: user.departamento || null,
            grado_estudios: user.grado_estudios || null,
            turno: user.turno || null,
            supervisor: user.supervisor || null,
            telefono: user.telefono || null,
            foto: null,
          },
          { transaction }
        );

        // === Backend sobrescribe la contraseña y fuerza rol válido ===
        const hash = await bcrypt.hash("Empleado2025", 10);

        // rol permitido (supervisor o empleado). Si es admin → empleado
        const finalRol =
          user.rol && user.rol === "supervisor" ? "supervisor" : "empleado";

        await Usuario.update(
  {
    password: hash,
    rol: "empleado", // ✅ Siempre empleado, ignoramos lo que venga en el CSV
  },
  { where: { id_data: empleado.id_data }, transaction }
);

        usersImported.push({
          numero_empleado: user.numero_empleado,
          nombre: user.nombre,
          correo_electronico: user.correo_electronico,
          rol: finalRol,
        });
      } catch (err) {
        console.error(`❌ Error en línea ${lineNumber}:`, err);
        validationErrors.push(
          `Línea ${lineNumber}: Error inesperado → ${err.message}`
        );
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: `${usersImported.length} usuarios importados exitosamente. ${validationErrors.length} registros fueron omitidos.`,
      importedCount: usersImported.length,
      skippedCount: validationErrors.length,
      skipped: validationErrors,
      users: usersImported,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error importing users:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export { upload };
