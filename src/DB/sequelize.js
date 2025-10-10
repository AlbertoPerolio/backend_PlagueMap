import { Sequelize } from "sequelize";
import config from "../config.js";

const sequelize = new Sequelize(
  config.mysql.database,
  config.mysql.user,
  config.mysql.password,
  {
    host: config.mysql.host,
    dialect: "mysql",
    logging: false,
  }
);

export async function connect() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a MySQL con Sequelize establecida correctamente");
    await sequelize.sync();
    console.log("Tablas sincronizadas");
  } catch (error) {
    console.error("Error al conectar o sincronizar MySQL:", error);
  }
}

export default sequelize;
