import { DataTypes } from "sequelize";
import sequelize from "../DB/sequelize.js";

const RegInf = sequelize.define(
  "RegInf",
  {
    id_reg: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    user: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "user", // roles posibles: "user", "admin"
    },
  },
  {
    tableName: "reg_inf",
    timestamps: true, // crea createdAt y updatedAt automáticamente
  }
);

export default RegInf;
