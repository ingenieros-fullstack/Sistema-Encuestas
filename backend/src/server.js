import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";

// Rutas
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import empleadoRoutes from "./routes/empleado.routes.js";
import supervisorRoutes from "./routes/supervisor.routes.js";

// Seeder
import { seedAdminYUsuario } from "./controllers/seeder.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ==========================
// Middlewares
// ==========================
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

// ==========================
// Healthcheck
// ==========================
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "encuestas-backend",
    ts: new Date().toISOString(),
  });
});

// ==========================
// Rutas principales
// ==========================
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/empleado", empleadoRoutes);
app.use("/supervisor", supervisorRoutes);

// ==========================
// 404 handler
// ==========================
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// ==========================
// Conexión a BD con reintento
// ==========================
const connectWithRetry = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a BD exitosa");

    // Ejecuta seeder para asegurar admin, empleado y supervisor
    await seedAdminYUsuario();
  } catch (error) {
    console.error("❌ Error de conexión a BD:", error.message);
    console.log("⏳ Reintentando en 5 segundos...");
    setTimeout(connectWithRetry, 5000);
  }
};

// ==========================
// Arranque servidor
// ==========================
app.listen(PORT, "0.0.0.0", async () => {
  await connectWithRetry();
  console.log(`🚀 Backend escuchando en http://0.0.0.0:${PORT}`);
});
