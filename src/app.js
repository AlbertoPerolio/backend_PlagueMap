import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import config from "./config.js";

// rutas
import register from "./modules/register/routes.js";
import auth from "./modules/auth/routes.js";
import markers from "./modules/plague-map/routes.js";
import error from "./red/errors.js";

// Sequelize
import { connect } from "./DB/sequelize.js";
await connect();

const app = express();

// --- Configuración de CORS ---
const allowedOrigins = [
  "https://frontend-plaguemap.vercel.app", // <-- dominio de Vercel
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Puerto ---
app.set("port", process.env.PORT || config.app.port);

// --- Configuración de Socket.IO ---
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Conexiones Socket.IO (logs removidos para producción)
io.on("connection", (socket) => {
  // Puedes usar socket.emit aquí si quieres mensajes iniciales
});

// Inyectamos la instancia de io en req para que rutas puedan usarla
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- Rutas ---
app.use("/api/users", register);
app.use("/api/auth", auth);
app.use("/api", markers);

// --- Manejo de errores ---
app.use(error);

// --- Exportar servidor y Socket.IO ---
export { httpServer, io };
