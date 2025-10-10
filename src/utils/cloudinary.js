// En src/utils/cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath);
    return result;
  } catch (error) {
    throw new Error("Error uploading image to Cloudinary");
  }
};
