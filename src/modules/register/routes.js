import express from "express";
import { requireRole } from "../../middleware/role.middleware.js";
import checkOwnershipOrAdmin from "../../middleware/checkOwnershipOrAdmin.js";
import checkToken from "./security.js";
import * as answers from "../../red/answer.js";
import controller from "./index.js";
import { registerSchema, updateUserSchema } from "../../schema/auth.schema.js";
import { validateSchema } from "../../middleware/validator.middleware.js";

const router = express.Router();

// --- RUTAS ---
// 1. Ver todos los usuarios -> solo admin
router.get("/", requireRole("admin"), all);

// 2. Ver un usuario -> propietario o admin
router.get("/:id", checkToken(), checkOwnershipOrAdmin(), one);

// 3. Crear usuario -> sin token necesario
router.post("/", validateSchema(registerSchema), addCreate);

// 4. Actualizar usuario completo -> propietario o admin
router.put(
  "/:id",
  validateSchema(updateUserSchema),
  checkToken(),
  checkOwnershipOrAdmin(),
  updateUserRoute
);

// 5. Actualizar solo rol -> admin
router.put("/:id/role", requireRole("admin"), updateRoleRoute);

// 6. Eliminar usuario -> admin
router.delete("/:id", requireRole("admin"), del);

// --- FUNCIONES DE RUTA ---
async function all(req, res, next) {
  try {
    const users = await controller.all();
    return answers.success(req, res, users, 200);
  } catch (err) {
    next(err);
  }
}

async function one(req, res, next) {
  try {
    const user = await controller.one(req.params.id);
    return answers.success(req, res, user, 200);
  } catch (err) {
    next(err);
  }
}

async function addCreate(req, res, next) {
  try {
    const user = await controller.add(req.body);
    return answers.success(req, res, user, 201);
  } catch (err) {
    next(err);
  }
}

async function updateUserRoute(req, res, next) {
  try {
    const id_reg = req.params.id;
    const result = await controller.updateUser(id_reg, req.body);

    return answers.success(req, res, result, 200);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const message =
      err.message || "Error interno del servidor durante la actualización.";
    return answers.error(req, res, message, statusCode);
  }
}

// ----------------------------
// UPDATE ROLE ROUTE MODIFICADA
// ----------------------------
async function updateRoleRoute(req, res, next) {
  try {
    const id_reg = req.params.id;
    const { role } = req.body;

    // Pasamos el usuario logueado al controlador para generar token si aplica
    const updatedUser = await controller.updateRole(id_reg, role, req.user);

    // Si se generó token, lo enviamos como cookie httpOnly
    if (updatedUser.token) {
      res.cookie("token", updatedUser.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        sameSite: "strict",
      });
      delete updatedUser.token; // no enviamos token en el body
    }

    return answers.success(req, res, updatedUser, 200);
  } catch (err) {
    next(err);
  }
}

async function del(req, res, next) {
  try {
    await controller.del(req.params.id);
    return answers.success(req, res, "Usuario eliminado", 200);
  } catch (err) {
    next(err);
  }
}

export default router;
