import createError from "../middleware/errors.js";
import PlagueReport from "../models/plague_report.js";

const checkOwnershipOrAdmin = () => async (req, res, next) => {
  try {
    const decoded = req.user;

    if (!decoded) {
      throw createError("Token no proporcionado", 401);
    }

    //  Si es admin, acceso inmediato
    if (decoded.role === "admin") return next();

    //  Verificación de ID de usuario (para rutas /api/users/:id)
    if (
      req.params.id &&
      parseInt(req.params.id, 10) === parseInt(decoded.id_reg, 10)
    ) {
      return next();
    }

    //  Verificación de ID de marcador (para rutas /api/markers/:idplague)
    if (req.params.idplague) {
      const marker = await PlagueReport.findByPk(req.params.idplague);
      if (!marker) throw createError("Marcador no encontrado", 404);
      if (parseInt(marker.id_reg, 10) === parseInt(decoded.id_reg, 10)) {
        return next();
      }
    }

    // Si no es admin y no es dueño, denegar acceso
    throw createError("No tienes privilegios para realizar esta acción", 403);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Error interno del servidor";
    const finalError = new Error(message);
    finalError.statusCode = statusCode;
    return next(finalError);
  }
};

export default checkOwnershipOrAdmin;
