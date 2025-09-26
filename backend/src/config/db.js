import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "encuestas_db",
  process.env.DB_USER || "encuestas_user",
  process.env.DB_PASSWORD || "encuestas_pass",
  {
    host: process.env.DB_HOST || "mysql", // 👈 nombre del servicio en docker-compose
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false,
  }
);

// Probar conexión al arrancar
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a la base de datos establecida correctamente.");
  } catch (error) {
    console.error("❌ Error de conexión a la base de datos:", error.message);
  }
})();

export default sequelize;
