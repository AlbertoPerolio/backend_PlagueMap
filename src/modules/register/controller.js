import bcrypt from "bcrypt";
import RegInf from "../../models/RegInf.js";

export default function registerController() {
  // Función 1: Crear usuario (add)
  async function add(data) {
    try {
      const userCount = await RegInf.count();
      const role = userCount === 0 ? "admin" : "user";

      const hashedPassword = await bcrypt.hash(data.password.toString(), 5);

      const user = await RegInf.create({
        name: data.name,
        email: data.email,
        user: data.user,
        password: hashedPassword,
        role,
      });

      return user;
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        const messages = err.errors.map((e) => {
          if (e.path === "user") return "El nombre de usuario ya existe";
          if (e.path === "email") return "El email ya está registrado";
          return e.message;
        });
        const error = new Error(messages.join(", "));
        error.statusCode = 409;
        throw error;
      }
      throw err;
    }
  }

  // Función 2: Ver todos los usuarios (all)
  async function all() {
    return await RegInf.findAll({
      attributes: { exclude: ["password"] },
    });
  }

  // Función 3: Ver un solo usuario (one)
  async function one(id_reg) {
    const user = await RegInf.findByPk(id_reg, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      const error = new Error(`Usuario con ID ${id_reg} no encontrado.`);
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  // Función 4: Actualizar datos completos del usuario (updateUser)
  async function updateUser(id_reg, data) {
    const fieldsToUpdate = {};
    const currentUser = await RegInf.findByPk(id_reg);

    if (!currentUser) {
      const error = new Error(`Usuario con ID ${id_reg} no encontrado.`);
      error.statusCode = 404;
      throw error;
    }

    // Cambio de contraseña
    if (data.password) {
      if (!data.currentPassword) {
        const error = new Error(
          "Debe proporcionar la contraseña actual para cambiarla."
        );
        error.statusCode = 400;
        throw error;
      }

      const isMatch = await bcrypt.compare(
        data.currentPassword.toString(),
        currentUser.password.toString()
      );

      if (!isMatch) {
        const error = new Error("La contraseña actual es incorrecta.");
        error.statusCode = 401;
        throw error;
      }

      const hashedPassword = await bcrypt.hash(data.password.toString(), 5);
      fieldsToUpdate.password = hashedPassword;
    }

    if (data.name) fieldsToUpdate.name = data.name;
    if (data.email) fieldsToUpdate.email = data.email;
    if (data.user) fieldsToUpdate.user = data.user;

    if (Object.keys(fieldsToUpdate).length === 0) {
      const error = new Error(
        "No se proporcionaron datos válidos para actualizar."
      );
      error.statusCode = 400;
      throw error;
    }

    const [updatedRows] = await RegInf.update(fieldsToUpdate, {
      where: { id_reg },
      individualHooks: true,
    });

    if (updatedRows === 0) {
      const error = new Error(
        `Usuario con ID ${id_reg} no encontrado para actualizar.`
      );
      error.statusCode = 404;
      throw error;
    }

    return {
      mensaje: "Usuario actualizado con éxito",
      id_reg,
      ...fieldsToUpdate,
    };
  }

  // Función 5: Actualizar solo el rol (updateRole)
  async function updateRole(id_reg, newRole) {
    if (!["admin", "user"].includes(newRole)) {
      const error = new Error("Rol inválido.");
      error.statusCode = 400;
      throw error;
    }

    const [updatedRows] = await RegInf.update(
      { role: newRole },
      { where: { id_reg } }
    );

    if (updatedRows === 0) {
      const error = new Error(`Usuario con ID ${id_reg} no encontrado.`);
      error.statusCode = 404;
      throw error;
    }

    return {
      id_reg,
      role: newRole,
      mensaje: "Rol de usuario actualizado con éxito.",
    };
  }

  return { add, all, one, updateUser, updateRole };
}
