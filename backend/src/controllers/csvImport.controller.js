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
    compania: "empresa",
    empresa: "empresa",

    // 🧩 TODAS LAS VARIANTES DE "CÓDIGO / CODIGO"
    codigo: "numero_empleado",
    código: "numero_empleado",
    Codigo: "numero_empleado",
    Código: "numero_empleado",
    CODIGO: "numero_empleado",
    CODIGOEMPLEADO: "numero_empleado",
    NoEmpleado: "numero_empleado",
    numeroempleado: "numero_empleado",
    numempleado: "numero_empleado",
    idempleado: "numero_empleado",
    empleadoid: "numero_empleado",

    nombre: "nombre",
    paterno: "apellido_paterno",
    materno: "apellido_materno",
    sexo: "sexo",
    nacimiento: "fecha_nacimiento",
    ingreso: "fecha_ingreso",
    email: "correo_electronico",
    correo: "correo_electronico",
    centro_trab: "centro_trabajo",
    centrotrabajo: "centro_trabajo",
    cc: "cc",
    cc_descrip: "cc_descrip",
    depto: "departamento",
    depto_descrip: "depto_descrip",
    antiguedad: "antiguedad",
    estudios: "grado_estudios",
    turno: "turno",
    supervisor: "supervisor",
    edad: "edad",
    telefono: "telefono",
    rfc: "rfc",
    "r.f.c": "rfc",
  };

  const normalize = (str) =>
    str
      .toString()
      .replace(/\u00A0/g, " ")
      .trim()
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

    // Empresa por defecto
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

      // 🔍 Log de depuración (solo las primeras filas)
      if (i < 5) console.log("🔍 Registro leído:", user);

      const errors = validateUserData(user, lineNumber);
      if (errors.length) {
        validationErrors.push(...errors);
        continue;
      }

      try {
        // ✅ Conversión segura de tipos
        const numero = user.numero_empleado != null
          ? String(user.numero_empleado).trim()
          : null;

        const correo = user.correo_electronico != null
          ? String(user.correo_electronico).trim().toLowerCase()
          : null;

        if (!numero) {
          validationErrors.push(`Línea ${lineNumber}: Falta número de empleado.`);
          continue;
        }
        if (!correo) {
          validationErrors.push(`Línea ${lineNumber}: Falta correo electrónico.`);
          continue;
        }

        // 1️⃣ Verificar si el usuario ya existe por número
        const existsUsuario = await Usuario.findOne({ where: { numero_empleado: numero } });
        if (existsUsuario) {
          console.log(`⚠️ Línea ${lineNumber}: usuario ya existe (${numero}), omitido.`);
          continue;
        }

        // 2️⃣ Crear o reutilizar empleado por correo
        let empleado = await DataEmpleado.findOne({ where: { correo_electronico: correo } });
        if (!empleado) {
          empleado = await DataEmpleado.create(
            { id_empresa: defaultEmpresa.id_empresa, ...user, correo_electronico: correo },
            { transaction }
          );
          console.log(`👤 Empleado creado (${user.nombre})`);
        } else {
          console.log(`👤 Empleado existente reutilizado (${user.nombre})`);
        }

        // 3️⃣ Generar contraseña base (RFC o por defecto)
        const plainPassword = user.rfc ? String(user.rfc).trim() : "Empleado2025";
        const hash = await bcrypt.hash(plainPassword, 10);

        // 4️⃣ Crear usuario con número_empleado
        await Usuario.create(
          {
            id_data: empleado.id_data,
            numero_empleado: numero,
            correo_electronico: correo,
            password: hash,
            rol: "empleado",
            estatus: 1,
            must_change_password: false,
          },
          { transaction }
        );

        console.log(`✅ Usuario creado (${numero} - ${correo})`);
        usersImported.push({
          numero_empleado: numero,
          nombre: user.nombre,
          correo_electronico: correo,
        });
      } catch (err) {
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
