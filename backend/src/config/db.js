import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 🧩 Resolver la ruta al .env global
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// 🗄️ Conexión Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || "encuestas_db",
  process.env.DB_USER || "encuestas_user",
  process.env.DB_PASS || "encuestas_pass",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false,
  }
);

// 🧠 Verificar conexión al iniciar
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a la base de datos establecida correctamente.");
  } catch (error) {
    console.error("❌ Error de conexión a la base de datos:", error.message);
  }
})();

export default sequelize;
