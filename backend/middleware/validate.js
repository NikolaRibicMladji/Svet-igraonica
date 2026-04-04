const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error.issues.map((issue) => issue.message).join(", "),
          errors: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      req.validated = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validate;
