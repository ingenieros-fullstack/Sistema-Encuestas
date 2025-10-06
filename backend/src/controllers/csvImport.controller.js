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

// === Multer en memoria ===
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = [".csv", ".xlsx", ".xls"];
    const ext = file.originalname.toLowerCase();
    allowed.some((t) => ext.includes(t))
      ? cb(null, true)
      : cb(new Error("Solo se permiten archivos CSV o Excel"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// === Normalizar nombres de columnas ===
const normalizeKeys = (row) => {
  const map = {
    "compania": "empresa",
    "empresa": "empresa",
    "codigo": "numero_empleado",
    "código": "numero_empleado",
    "nombre": "nombre",
    "paterno": "apellido_paterno",
    "materno": "apellido_materno",
    "sexo": "sexo",
    "nacimiento": "fecha_nacimiento",
    "ingreso": "fecha_ingreso",
    "email": "correo_electronico",
    "correo": "correo_electronico",
    "centro_trab": "centro_trabajo",
    "centrotrabajo": "centro_trabajo",
    "cc": "cc",
    "cc_descrip": "cc_descrip",
    "depto": "departamento",
    "depto_descrip": "depto_descrip",
    "antiguedad": "antiguedad",
    "estudios": "grado_estudios",
    "turno": "turno",
    "supervisor": "supervisor",
    "edad": "edad",
    "telefono": "telefono",
  };

  const normalize = (str) =>
    str
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_]/g, "")
      .toLowerCase();

  const newRow = {};
  for (const [key, value] of Object.entries(row)) {
    const cleanKey = normalize(key);
    const mapped = map[cleanKey] || cleanKey;
    newRow[mapped] = value;
  }
  return newRow;
};

// === Detectar separador CSV ===
const detectSeparator = (firstLine) => {
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  return semicolons > commas ? ";" : ",";
};

// === Validar datos mínimos ===
const validateUserData = (userData, lineNumber) => {
  const errors = [];
  if (!userData.numero_empleado)
    errors.push(`Línea ${lineNumber}: Falta el campo "Código".`);
  if (!userData.nombre)
    errors.push(`Línea ${lineNumber}: Falta el campo "Nombre".`);
  if (!userData.correo_electronico)
    errors.push(`Línea ${lineNumber}: Falta el campo "Email".`);
  if (userData.sexo && !["M", "F", "O"].includes(userData.sexo)) {
    errors.push(`Línea ${lineNumber}: Sexo inválido (M, F u O).`);
  }
  return errors;
};

// === Parsear CSV ===
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
        .on("data", (row) => results.push(normalizeKeys(row)))
        .on("end", () => resolve(results))
        .on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

// === Parsear Excel ===
const parseExcel = (buffer) => {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const raw = xlsx.utils.sheet_to_json(worksheet);
  return raw.map(normalizeKeys);
};

// === Extraer edad ===
const parseEdad = (value) => {
  if (!value) return null;
  const match = String(value).match(/(\d{1,3})\s*A/);
  if (match) return parseInt(match[1], 10);
  const onlyNum = parseInt(String(value).replace(/\D/g, ""), 10);
  return isNaN(onlyNum) ? null : onlyNum;
};

// === Importar usuarios ===
export const importUsers = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se ha subido ningún archivo",
      });
    }

    const isCSV = req.file.originalname.toLowerCase().includes(".csv");
    const userData = isCSV
      ? await parseCSV(req.file.buffer)
      : parseExcel(req.file.buffer);

    if (!userData || userData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El archivo está vacío o tiene formato incorrecto.",
      });
    }

    const filteredData = userData.filter((u) => Object.keys(u).length > 0);
    filteredData.forEach((u) => {
      u.edad = parseEdad(u.edad);
      if (u.antiguedad) {
        const match = String(u.antiguedad).match(/(\d{1,3})/);
        u.antiguedad = match ? parseInt(match[1], 10) : null;
      }
    });

    // Asegurar empresa demo
    let defaultEmpresa = await Empresa.findByPk(1);
    if (!defaultEmpresa) {
      defaultEmpresa = await Empresa.create({
        nombre: "Empresa Demo",
        correo_electronico: "demo@empresa.com",
      });
    }

    const validationErrors = [];
    const usersImported = [];

    for (let i = 0; i < filteredData.length; i++) {
      const user = filteredData[i];
      const lineNumber = i + 2;

      const errors = validateUserData(user, lineNumber);
      if (errors.length) {
        validationErrors.push(...errors);
        continue;
      }

      try {
        const numero = user.numero_empleado;
        const correo = user.correo_electronico?.trim().toLowerCase();

        const existsEmpleado = await DataEmpleado.findOne({ where: { numero_empleado: numero } });
        const existsUsuario = await Usuario.findOne({ where: { correo_electronico: correo } });

        // Si ya existe, lo omitimos sin marcar error
        if (existsEmpleado && existsUsuario) {
          console.log(`⚠️ Línea ${lineNumber}: empleado ya existe, omitido.`);
          continue;
        }

        const empleado = existsEmpleado
          ? existsEmpleado
          : await DataEmpleado.create(
              { id_empresa: defaultEmpresa.id_empresa, ...user, correo_electronico: correo },
              { transaction }
            );

        if (!existsUsuario) {
          const hash = await bcrypt.hash("Empleado2025", 10);
          await Usuario.create(
            {
              id_data: empleado.id_data,
              correo_electronico: correo,
              password: hash,
              rol: "empleado",
              estatus: 1,
              must_change_password: true,
            },
            { transaction }
          );
        }

        usersImported.push({
          numero_empleado: numero,
          nombre: user.nombre,
          correo_electronico: correo,
        });
      } catch (err) {
        // si es duplicado o validación, no lo marcamos como error crítico
        if (err?.name?.includes("Unique") || err?.name?.includes("Validation")) {
          console.warn(`⚠️ Línea ${lineNumber}: duplicado omitido (${err.message})`);
          continue;
        }
        console.error(`❌ Error en línea ${lineNumber}:`, err.message);
        validationErrors.push(`Línea ${lineNumber}: Error inesperado (${err.message})`);
      }
    }

    await transaction.commit();

    const msg =
      usersImported.length > 0
        ? `✅ ${usersImported.length} empleados importados correctamente. ${validationErrors.length} registros omitidos.`
        : "⚠️ Todos los registros ya existían o fueron omitidos.";

    res.json({
      success: true,
      message: msg,
      importedCount: usersImported.length,
      skippedCount: validationErrors.length,
      skipped: validationErrors,
      users: usersImported,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error importando usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export { upload };
