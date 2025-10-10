import express from "express";
import controller from "./index.js";
import { validateSchema } from "../../middleware/validator.middleware.js";
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

// --- RUTA LOGIN ---
router.post("/login", validateSchema(loginSchema), async (req, res) => {
  try {
    // Pasamos `res` al controlador para que cree la cookie
    const result = await controller.login(
      req.body.user,
      req.body.password,
      res
    );

    // Devuelve usuario y token en el body (para móvil)
    res.json({
      error: false,
      body: { mensaje: "Login exitoso" },
      ...result, // { user, token }
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: true,
      body: { mensaje: err.message },
    });
  }
});

// --- RUTA VERIFY ---
router.get("/verify", (req, res) => {
  let token = getTokenFromHeader(req);

  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res
      .status(401)
      .json({ error: true, mensaje: "No se encontró token" });
  }

  try {
    const decoded = controller.verifyToken(token); // Usamos la función del controlador
    res.json({ error: false, user: decoded });
  } catch (err) {
    res.status(401).json({ error: true, mensaje: "Token inválido" });
  }
});

// --- RUTA LOGOUT ---
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
