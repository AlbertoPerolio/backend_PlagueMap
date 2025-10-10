import bcrypt from "bcrypt";
import RegInf from "../../models/RegInf.js";
import { assignToken } from "../../authlog/index.js";

export default function authController() {
  async function login(identifier, password) {
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

    return assignToken(user.toJSON());
  }

  return { login };
}
