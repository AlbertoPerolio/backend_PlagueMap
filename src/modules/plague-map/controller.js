import PlagueReport from "../../models/plague_report.js";
import { uploadImageToCloudinary } from "../../utils/cloudinary.js";
import fs from "fs";

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

    // req.io se inyecta desde app.js
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

export const getAllMarkers = async (req, res, next) => {
  try {
    const markers = await PlagueReport.findAll();
    res.status(200).json(markers);
  } catch (error) {
    next(error);
  }
};

export const updateMarker = async (req, res, next) => {
  try {
    const { idplague } = req.params;
    const { title, description, lat, lng } = req.body;
    const marker = await PlagueReport.findByPk(idplague);

    if (!marker) {
      return res.status(404).json({ message: "Marker not found" });
    }

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

    // Notifica que el marcador fue actualizado
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

export const deleteMarker = async (req, res, next) => {
  try {
    const { idplague } = req.params;
    const marker = await PlagueReport.findByPk(idplague);

    if (!marker) {
      return res.status(404).json({ message: "Marker not found" });
    }

    await marker.destroy();

    //  Notifica que el marcador fue eliminado
    req.io.emit("plague_report_update", {
      action: "deleted",
      idplague: Number(idplague),
    });

    res.status(200).json({ message: "Marker deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const approveMarker = async (req, res, next) => {
  try {
    const { idplague } = req.params;
    const marker = await PlagueReport.findByPk(idplague);

    if (!marker) {
      return res.status(404).json({ message: "Marker not found" });
    }

    marker.status = "aprobado";
    await marker.save();

    // Notifica que el estado cambió a 'aprobado'
    req.io.emit("plague_report_update", {
      action: "approved",
      marker: marker.toJSON(),
    });

    res.status(200).json(marker);
  } catch (error) {
    next(error);
  }
};
