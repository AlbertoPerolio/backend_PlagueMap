// app.js
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
const allowedOrigins = ["https://frontend-plaguemap.vercel.app/"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `La política de CORS no permite el acceso desde este origen: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

io.on("connection", (socket) => {
  // Aquí puedes emitir mensajes iniciales si quieres
});

// Inyectamos io en req
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

export { app, httpServer, io };
