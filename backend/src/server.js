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

// Rutas
app.use("/auth", authRoutes);

// 🔹 función para reintentar la conexión a BD
const connectWithRetry = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a BD exitosa");
  } catch (error) {
    console.error("❌ Error de conexión a BD:", error.message);
    console.log("⏳ Reintentando en 5 segundos...");
    setTimeout(connectWithRetry, 5000);
  }
};

app.listen(PORT, "0.0.0.0", async () => {
  const connectWithRetry = async () => {
    try {
      await sequelize.authenticate();
      console.log("✅ Conexión a BD exitosa");

      // Ejecuta el seeder de admin
      await seedAdmin();
    } catch (error) {
      console.error("❌ Error de conexión a BD:", error.message);
      console.log("⏳ Reintentando en 5 segundos...");
      setTimeout(connectWithRetry, 5000);
    }
  };

  connectWithRetry();
  console.log(`🚀 Backend escuchando en http://0.0.0.0:${PORT}`);
});