import * as auth from "../../authlog/index.js";
import createError from "../../middleware/errors.js";

export default function checkToken() {
  return function middleware(req, res, next) {
    try {
      let token = null;

      // Intentar obtener token del Header Authorization
      if (req.headers.authorization) {
        token = req.headers.authorization.replace("Bearer ", "");
      }

      // Intentar obtener token desde Cookie
      if (!token && req.cookies?.token) {
        token = req.cookies.token;
      }

      // Si no hay token en ningún lado, permitir creación de usuario (id_reg = 0)
      if (!token) {
        if (req.body?.id_reg === 0) return next();
        throw createError("Token requerido", 401);
      }

      // Obtener usuario decodificado
      const user = auth.checkToken.confToken(
        req,
        req.body?.id_reg || req.params?.id || null
      );
      if (!user) throw createError("Token inválido", 401);

      req.user = user; // dejamos info disponible

      // --- VERIFICACIÓN DE PRIVILEGIOS ---
      const isAdmin = user.role === "admin";

      if (isAdmin) {
        return next();
      }

      // Usuario normal: solo puede modificar/eliminar sus propios recursos
      const resourceOwnerId = req.body?.id_reg || req.params?.id || null;

      if (
        resourceOwnerId &&
        parseInt(resourceOwnerId, 10) !== parseInt(user.id_reg, 10)
      ) {
        throw createError("No tienes privilegios para hacer esto", 401);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
