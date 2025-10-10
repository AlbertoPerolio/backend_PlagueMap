import jwt from "jsonwebtoken";
import config from "../config.js";

export function requireRole(role) {
  return (req, res, next) => {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ error: true, mensaje: "¿Que haces aquí?" });

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      if (decoded.role !== role) {
        return res.status(403).json({
          error: true,
          mensaje: "No eres administrador ¿Como llegaste a este lugar?",
        });
      }
      req.user = decoded; // guardamos info del usuario para usarla si hace falta
      next();
    } catch (err) {
      res
        .status(401)
        .json({ error: true, mensaje: "Token inválido o expirado" });
    }
  };
}
