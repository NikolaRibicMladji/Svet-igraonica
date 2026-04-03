const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    const zodIssues = err?.issues || err?.errors || [];

    const errors = zodIssues.map((e) => ({
      field: Array.isArray(e.path) ? e.path.join(".") : "",
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: errors[0]?.message || err?.message || "Validation error",
      errors,
    });
  }
};

module.exports = validate;
