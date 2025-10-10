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
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  return null;
}

// RUTA DE LOGIN
router.post("/login", validateSchema(loginSchema), async (req, res) => {
  try {
    const token = await controller.login(req.body.user, req.body.password);
    const decodedUser = jwt.verify(token, config.jwt.secret);

    const isProduction = process.env.NODE_ENV === "production";

    // Configuración de la Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // HTTPS en producción
      sameSite: isProduction ? "none" : "lax",
    });

    // Devuelve token y user
    res.json({
      error: false,
      body: { mensaje: "Login exitoso" },
      token,
      user: decodedUser,
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ error: true, body: { mensaje: err.message } });
  }
});

// RUTA DE VERIFY
router.get("/verify", (req, res) => {
  let token = getTokenFromHeader(req) || req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ error: true, mensaje: "No se encontró token" });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    res.json({ error: false, user: decoded });
  } catch (err) {
    res.status(401).json({ error: true, mensaje: "Token inválido" });
  }
});

// RUTA DE LOGOUT
router.post("/logout", (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(0), // Expira inmediatamente
  });

  res.json({ mensaje: "Logout exitoso" });
});

export default router;
