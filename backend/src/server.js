// ==============================================
// 📦 SERVIDOR BACKEND PRODUCCIÓN - SISTEMA ENCUESTAS
// ==============================================

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import sequelize from "./config/db.js";

// ==========================
// Importar rutas
// ==========================
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import empleadoRoutes from "./routes/empleado.routes.js";
import supervisorRoutes from "./routes/supervisor.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import publicRoutes from "./routes/public.routes.js";

// 🔹 Encuestas
import adminEncuestasRoutes from "./routes/adminEncuestas.routes.js";
import empleadoEncuestasRoutes from "./routes/empleadoEncuestas.routes.js";
import supervisorEncuestasRoutes from "./routes/supervisorEncuestas.routes.js";

// 🔹 Cuestionarios
import adminCuestionariosRoutes from "./routes/adminCuestionarios.routes.js";
import empleadoCuestionariosRoutes from "./routes/empleadoCuestionarios.routes.js";

// 🔹 Asignaciones y respuestas
import asignacionRoutes from "./routes/asignacionRoutes.js";
import adminRespuestasRoutes from "./routes/adminRespuestas.routes.js";

// 🧩 Asociaciones Sequelize
import "./models/associations.js";

// Seeder
import { seedAdminYUsuario } from "./controllers/seeder.js";

// ==============================================
// 🔧 Configuración
// ==============================================
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const ENV = process.env.NODE_ENV || "development";

console.log(`🌍 Entorno: ${ENV}`);

// ==============================================
// 🛡️ Middlewares
// ==============================================
const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// ==============================================
// 📂 Archivos estáticos
// ==============================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  console.warn("⚠️  La carpeta de uploads no existe:", UPLOADS_DIR);
}
app.use("/uploads", express.static(UPLOADS_DIR));

// ==============================================
// 💓 Healthcheck
// ==============================================
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "encuestas-backend",
    ts: new Date().toISOString(),
  });
});

// ==============================================
// 🧾 Logging de requests
// ==============================================
if (ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`➡️  ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ==============================================
// 🚦 Rutas principales
// ==============================================
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/empleado", empleadoRoutes);
app.use("/supervisor", supervisorRoutes);
app.use("/admin/usuarios", usuariosRoutes);

// 🔹 Encuestas
app.use("/admin/encuestas", adminEncuestasRoutes);
app.use("/empleado/encuestas", empleadoEncuestasRoutes);
app.use("/supervisor/encuestas", supervisorEncuestasRoutes);
app.use("/admin/encuestas", adminRespuestasRoutes);

// 🔹 Cuestionarios
app.use("/admin/cuestionarios", adminCuestionariosRoutes);
app.use("/empleado/cuestionarios", empleadoCuestionariosRoutes);

// 🔹 Asignaciones
app.use("/asignaciones", asignacionRoutes);

// 🔹 Públicas
app.use("/", publicRoutes);

// ==============================================
// 🚫 404 handler
// ==============================================
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// ==============================================
// 💾 Conexión a la base de datos
// ==============================================
const checkSchemaReady = async () => {
  try {
    await sequelize.query("SELECT 1 FROM empresas LIMIT 1;");
    return true;
  } catch {
    return false;
  }
};

const connectWithRetry = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a BD exitosa");

    let ready = false;
    while (!ready) {
      ready = await checkSchemaReady();
      if (!ready) {
        console.log("⏳ Tablas aún no listas, reintentando en 5s...");
        await new Promise((res) => setTimeout(res, 5000));
      }
    }

    await seedAdminYUsuario();
  } catch (error) {
    console.error("❌ Error de conexión a BD:", error.message);
    console.log("⏳ Reintentando en 5 segundos...");
    setTimeout(connectWithRetry, 5000);
  }
};

// ==============================================
// 🚀 Arranque del servidor
// ==============================================
const startServer = async () => {
  await connectWithRetry();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Backend corriendo en puerto ${PORT}`);
  });
};

// Passenger ignora el puerto real, pero esto garantiza compatibilidad
startServer();
