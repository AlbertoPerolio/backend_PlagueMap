import express from "express";
import controller from "./index.js";
import { validateSchema } from "../../middleware/validator.middleware.js";
import jwt from "jsonwebtoken";
import config from "../../config.js";
import { loginSchema } from "../../schema/auth.schema.js";

const router = express.Router();

// Función auxiliar para React Native: obtiene el token del header
function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization || "";
  // Busca 'Bearer ' y extrae el resto
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  return null;
}

// RUTA DE LOGIN (Usamos la versión corregida de la sesión anterior)
router.post("/login", validateSchema(loginSchema), async (req, res) => {
  try {
    const token = await controller.login(req.body.user, req.body.password);
    const decodedUser = jwt.verify(token, config.jwt.secret);
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    // Solo enviar el usuario decodificado
    res.json({
      error: false,
      body: { mensaje: "Login exitoso" },
      user: decodedUser,
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ error: true, body: { mensaje: err.message } });
  }
});

// RUTA DE VERIFY (CRÍTICA PARA EVITAR EL BUCLE)
router.get("/verify", (req, res) => {
  // 1. Obtener el token del Authorization Header (Móvil)
  let token = getTokenFromHeader(req);

  // 2. Si no está en el Header, obtenerlo de la Cookie (Web)
  if (!token) {
    token = req.cookies.token;
  }

  // 3. Si NO hay token, retornar 401
  if (!token) {
    return res
      .status(401) // 🚨 Importante: DEBE ser 401
      .json({ error: true, mensaje: "No se encontró token" });
  }

  try {
    // 4. Verifica y decodifica el token
    const decoded = jwt.verify(token, config.jwt.secret);

    // 5. Devuelve el objeto decodificado como 'user'
    // El objeto 'decoded' es lo que assignToken firmó, que incluye los datos del usuario.
    res.json({ error: false, user: decoded });
  } catch (err) {
    // 6. Si el token es inválido/expirado, retornar 401
    res.status(401).json({ error: true, mensaje: "Token inválido" });
  }
});

router.post("/logout", (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
  }); // Expira inmediatamente });
  res.json({ mensaje: "Logout exitoso" });
});
export default router;
