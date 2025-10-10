import PlagueReport from "../../models/plague_report.js"; // Se mantiene tu importación original
import { uploadImageToCloudinary } from "../../utils/cloudinary.js"; // Se mantiene tu importación original
import fs from "fs";

// ==========================================================
// 1. CREAR MARCADOR (POST /markers)
// ==========================================================
export const createMarker = async (req, res, next) => {
  try {
    const { title, description, id_reg, status, lat, lng } = req.body;
    let imgurl = null;

    if (!req.file) {
      return res.status(400).json({
        error: true,
        mensaje: "No se ha subido ningún archivo de imagen.",
      });
    }

    const result = await uploadImageToCloudinary(req.file.path);

    if (result && result.secure_url) {
      imgurl = result.secure_url;
      fs.unlinkSync(req.file.path);
    } else {
      throw new Error(
        "Error al subir la imagen a Cloudinary. Por favor, inténtelo de nuevo."
      );
    }

    const newMarker = await PlagueReport.create({
      title,
      description,
      id_reg: parseInt(id_reg, 10),
      status: status || "pendiente",
      imgurl,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });

    // 🚀 EMITIR SOCKET: Notifica que un marcador fue creado
    // req.io se inyecta desde tu app.js
    req.io.emit("plague_report_update", {
      action: "created",
      marker: newMarker.toJSON(),
    });

    return res.status(201).json(newMarker);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// ==========================================================
// 2. OBTENER TODOS LOS MARCADORES (GET /markers)
// ==========================================================
export const getAllMarkers = async (req, res, next) => {
  try {
    const markers = await PlagueReport.findAll();
    res.status(200).json(markers);
  } catch (error) {
    next(error);
  }
};

// ==========================================================
// 3. ACTUALIZAR MARCADOR (PUT /markers/:idplague)
// ==========================================================
export const updateMarker = async (req, res, next) => {
  try {
    const { idplague } = req.params;
    const { title, description, lat, lng } = req.body;
    const marker = await PlagueReport.findByPk(idplague);

    if (!marker) {
      return res.status(404).json({ message: "Marker not found" });
    }

    // Se asume que la lógica de autorización viene de un middleware

    let updateData = {
      title,
      description,
      lat: parseFloat(lat || marker.lat),
      lng: parseFloat(lng || marker.lng),
    };

    // Comprueba si se subió un nuevo archivo
    if (req.file) {
      const result = await uploadImageToCloudinary(req.file.path);
      if (result && result.secure_url) {
        fs.unlinkSync(req.file.path);
        updateData.imgurl = result.secure_url;
      } else {
        throw new Error("Error al subir nueva imagen a Cloudinary.");
      }
    }

    // Actualiza el marcador
    await marker.update(updateData);

    // 🚀 EMITIR SOCKET: Notifica que el marcador fue actualizado
    req.io.emit("plague_report_update", {
      action: "updated",
      marker: marker.toJSON(),
    });

    res.status(200).json(marker);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// ==========================================================
// 4. ELIMINAR MARCADOR (DELETE /markers/:idplague)
// ==========================================================
export const deleteMarker = async (req, res, next) => {
  try {
    const { idplague } = req.params;
    const marker = await PlagueReport.findByPk(idplague);

    if (!marker) {
      return res.status(404).json({ message: "Marker not found" });
    }

    await marker.destroy();

    // 🚀 EMITIR SOCKET: Notifica que el marcador fue eliminado
    req.io.emit("plague_report_update", {
      action: "deleted",
      idplague: Number(idplague),
    });

    res.status(200).json({ message: "Marker deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ==========================================================
// 5. APROBAR MARCADOR (PUT /markers/:idplague/approve)
// ==========================================================
export const approveMarker = async (req, res, next) => {
  try {
    const { idplague } = req.params;
    const marker = await PlagueReport.findByPk(idplague);

    if (!marker) {
      return res.status(404).json({ message: "Marker not found" });
    }

    marker.status = "aprobado";
    await marker.save();

    // 🚀 EMITIR SOCKET: Notifica que el estado cambió a 'aprobado'
    req.io.emit("plague_report_update", {
      action: "approved",
      marker: marker.toJSON(),
    });

    res.status(200).json(marker);
  } catch (error) {
    next(error);
  }
};
