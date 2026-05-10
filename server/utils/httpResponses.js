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
  console.error('[Server Error]', error);
  return sendError(res, 500, 'Internal server error', 'INTERNAL_SERVER_ERROR');
};

module.exports = {
  sendError,
  sendServerError,
};
