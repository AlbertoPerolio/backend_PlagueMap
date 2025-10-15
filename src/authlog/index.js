import jwt from "jsonwebtoken";
import config from "../config.js";
import createError from "../middleware/errors.js";

const secret = config.jwt.secret;

// Genera un token
export function assignToken(data) {
  return jwt.sign(data, secret); // token
}

// Verifica un token
export function verifyToken(token) {
  return jwt.verify(token, secret);
}

// Middleware / función de seguridad
export const checkToken = {
  confToken(req, id) {
    if (id === 0) return null; // permite la creación de un usuario

    try {
      const decrypted = decryptToken(req); // decodifica y asigna req.user
      return decrypted;
    } catch (err) {
      throw createError("Token inválido", 401);
    }
  },
};

// Decodifica token y lo asigna a req.user
function decryptToken(req) {
  let token = null;

  // Intentar obtener token del header
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  // Si no hay token en header, buscar en cookie
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw createError("No hay token", 401);
  }

  const decrypted = verifyToken(token);
  req.user = decrypted; // deja la info del usuario disponible
  return decrypted;
}
