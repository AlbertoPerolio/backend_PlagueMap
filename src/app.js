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

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8081",
      "http://192.168.0.92:8081",
      "http://192.168.0.92",
    ],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// configuración
app.set("port", config.app.port);

// --- 🚀 CONFIGURACIÓN DE SOCKET.IO ---

// 1. Creamos el servidor HTTP envolviendo la aplicación Express
const httpServer = createServer(app);

// 2. Inicializamos Socket.IO en el servidor HTTP
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:8081",
      "http://192.168.0.92:8081",
      "http://192.168.0.92",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// 3. Manejar conexiones de Socket.IO
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Nuevo cliente conectado: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
  });

  // Puedes emitir un mensaje de prueba al cliente al conectarse
  // socket.emit('status', 'Conexión en tiempo real establecida.');
});

// 4. Inyectamos la instancia de Socket.IO en el objeto `req`
// Esto es VITAL para que los controladores de rutas (e.g., creación de marcadores)
// puedan acceder a `io` y emitir eventos.
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- FIN CONFIGURACIÓN DE SOCKET.IO ---

// rutas
app.use("/api/users", register);
app.use("/api/auth", auth);
app.use("/api", markers);
app.use(error);

// Cambiamos el export para exportar el servidor HTTP, no la app Express,
// y exportamos la instancia de io.
export { httpServer, io };
