export const validateSchema = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const errors = error.errors
      ? error.errors.map((e) => e.message)
      : [error.message || "Datos inválidos"];

    const message = errors.length === 1 ? errors[0] : errors;

    return res.status(400).json({ error: message });
  }
};
