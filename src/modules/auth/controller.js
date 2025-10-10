// authController.js
import bcrypt from "bcrypt";
import RegInf from "../../models/RegInf.js";
import { assignToken } from "../../authlog/index.js";

export default function authController() {
  async function login(identifier, password, res) {
    let user = await RegInf.findOne({ where: { user: identifier } });
    if (!user) user = await RegInf.findOne({ where: { email: identifier } });
    if (!user) {
      const error = new Error("El usuario no existe");
      error.statusCode = 404;
      throw error;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const error = new Error("Datos incorrectos");
      error.statusCode = 401;
      throw error;
    }

    const token = assignToken({
      id_reg: user.id_reg,
      role: user.role,
      name: user.name,
    });

    // Guardar token en cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return {
      user: {
        id_reg: user.id_reg,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  return { login };
}
