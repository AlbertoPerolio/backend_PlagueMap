import { DataTypes } from "sequelize";
import sequelize from "../DB/sequelize.js";
import RegInf from "./RegInf.js";

const PlagueReport = sequelize.define(
  "PlagueReport",
  {
    idplague: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_reg: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: RegInf,
        key: "id_reg",
      },
      onDelete: "CASCADE", // elimina reportes si el usuario se elimina
      onUpdate: "CASCADE",
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imgurl: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: "pendiente", // puedes usar pendiente o aprobado
    },
  },
  {
    tableName: "plague_report",
    timestamps: true, // crea createdAt y updatedAt
  }
);

// Relación con RegInf
PlagueReport.belongsTo(RegInf, { foreignKey: "id_reg" });
RegInf.hasMany(PlagueReport, { foreignKey: "id_reg" });

export default PlagueReport;
