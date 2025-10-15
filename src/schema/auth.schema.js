import { z } from "zod";

export const registerSchema = z.object({
  id_reg: z.number().optional().default(0),
  name: z
    .string({ required_error: "Nombre es requerido" })
    .min(1, { message: "Nombre es requerido" }),
  user: z
    .string({ required_error: "Nombre de Usuario Requerido" })
    .min(1, { message: "Nombre de Usuario Requerido" }),
  email: z.string({ required_error: "Email requerido" }).email(),
  password: z.string({ required_error: "Contraseña requerida" }).min(6, {
    message: "La contraseña tiene que tener al menos 6 caracteres",
  }),
});

export const updateUserSchema = z
  .object({
    // Hacemos name, user y email opcionales para permitir actualizaciones parciales
    name: z.string().min(1, { message: "Nombre no válido" }).optional(),
    user: z.string().min(1, { message: "Usuario no válido" }).optional(),
    email: z.string().email({ message: "Email no válido" }).optional(),

    // La nueva contraseña ('password') es opcional
    password: z
      .string()
      .min(6, {
        message: "La nueva contraseña debe tener al menos 6 caracteres",
      })
      .optional(),

    // currentPassword es un campo de control y siempre debe ser opcional en la validación
    currentPassword: z.string().optional(),
  })
  .refine(
    // también se envía la contraseña actual. Si no se envía 'password', se ignora.
    (data) => {
      if (data.password) {
        return !!data.currentPassword;
      }
      return true;
    },
    {
      message:
        "Si proporciona una nueva contraseña, debe ingresar la contraseña actual.",
      path: ["currentPassword"],
    }
  );

export const loginSchema = z.object({
  user: z.string({
    required_error: "Usuario es requerido",
  }),
  password: z
    .string({
      required_error: "Contraseña es requerida",
    })
    .min(6, {
      message: "La contraseña tiene que tener al menos 6 caracteres",
    }),
});
