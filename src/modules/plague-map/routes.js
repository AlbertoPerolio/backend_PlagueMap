import express from "express";
import multer from "multer";
import {
  createMarker,
  getAllMarkers,
  updateMarker,
  deleteMarker,
  approveMarker,
} from "./controller.js";
import checkOwnershipOrAdmin from "../../middleware/checkOwnershipOrAdmin.js";
import { requireRole } from "../../middleware/role.middleware.js";
import checkToken from "../register/security.js";
const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Rutas para los marcadores
router.get("/markers", getAllMarkers);

// Ruta para CREAR un marcador:
router.post(
  "/markers",
  upload.single("image"),
  (req, res, next) => {
    next(); // Pasa al siguiente middleware (createMarker)
  },
  createMarker
);

// ✅ Ruta para ACTUALIZAR un marcador:
router.put(
  "/markers/:idplague",
  checkToken(), // <-- AGREGAR
  checkOwnershipOrAdmin(),
  upload.single("image"),
  updateMarker
);

router.delete(
  "/markers/:idplague",
  checkToken(), // <-- AGREGAR
  checkOwnershipOrAdmin(),
  deleteMarker
);

// ✅ Ruta para APROBAR un marcador:
router.put(
  "/markers/:idplague/approve",
  checkToken(),
  requireRole("admin"),
  approveMarker
);
export default router;
