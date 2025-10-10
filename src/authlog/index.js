import jwt from "jsonwebtoken";
import config from "../config.js";
import createError from "../middleware/errors.js";

const secret = config.jwt.secret;

// --- Genera un token ---
export function assignToken(data) {
  return jwt.sign(data, secret); // token
}

// --- Verifica un token ---
export function verifyToken(token) {
  return jwt.verify(token, secret);
}

// --- Middleware / función de seguridad ---
export const checkToken = {
  confToken(req, id) {
    if (id === 0) return null; // permite la creación de un usuario
    const decrypted = decryptHeader(req); // decodifica y asigna req.user
    return decrypted;
  },
};

// --- Extrae token del header ---
function getToken(authHeader) {
  if (!authHeader) {
    throw createError("No hay token", 401);
  }
  if (!authHeader.includes("Bearer")) {
    throw createError("Formato invalido", 401);
  }
  return authHeader.replace("Bearer", "").trim();
}

// --- Decodifica token y lo asigna a req.user ---
function decryptHeader(req) {
  const authHeader = req.headers.authorization || "";
  const token = getToken(authHeader);
  const decrypted = verifyToken(token);

  req.user = decrypted; // deja la info del usuario disponible
  return decrypted;
}
