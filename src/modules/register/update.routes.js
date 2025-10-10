import express from "express";
import checkOwnershipOrAdmin from "../../middleware/checkOwnershipOrAdmin.js";
import { registerSchema } from "../../schema/auth.schema.js";
import { validateSchema } from "../../middleware/validator.middleware.js";
import * as answers from "../../red/answer.js";
import controller from "./index.js";

const router = express.Router();

router.put("/", validateSchema(registerSchema), checkOwnershipOrAdmin, add);

async function add(req, res, next) {
  try {
    const item = await controller.add(req.body);
    return answers.success(req, res, "Usuario Actualizado", 201);
  } catch (err) {
    next(err);
  }
}

export default router;
