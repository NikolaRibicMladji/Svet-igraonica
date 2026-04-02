const successResponse = (
  res,
  data = null,
  message = "Uspešno",
  status = 200,
  meta = null,
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  });
};

const errorResponse = (
  res,
  message = "Greška",
  status = 500,
  errors = null,
) => {
  return res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
