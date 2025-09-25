import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import { seedAdmin } from "./controllers/seeder.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ==========================
// Rutas principales
// ==========================
app.use("/auth", authRoutes);

// ==========================
// Función de conexión a BD con reintento
// ==========================
const connectWithRetry = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a BD exitosa");

    // Ejecuta el seeder para asegurar que el admin exista
    await seedAdmin();
  } catch (error) {
    console.error("❌ Error de conexión a BD:", error.message);
    console.log("⏳ Reintentando en 5 segundos...");
    setTimeout(connectWithRetry, 5000);
  }
};

// ==========================
// Servidor
// ==========================
app.listen(PORT, "0.0.0.0", async () => {
  await connectWithRetry();
  console.log(`🚀 Backend escuchando en http://0.0.0.0:${PORT}`);
});
