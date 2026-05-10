const sendError = (res, status, message, code = 'REQUEST_ERROR', details) => {
  return res.status(status).json({
    message,
    error: {
      code,
      status,
      ...(details && { details }),
    },
  });
};

const sendServerError = (res, error) => {
  return sendError(res, 500, error.message || 'Internal server error', 'INTERNAL_SERVER_ERROR');
};

module.exports = {
  sendError,
  sendServerError,
};
