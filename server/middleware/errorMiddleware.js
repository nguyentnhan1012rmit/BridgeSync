const { sendError } = require('../utils/httpResponses');

const notFound = (req, res) => {
  sendError(res, 404, `Route not found: ${req.originalUrl}`, 'ROUTE_NOT_FOUND');
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || err.status || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');
  const message = status === 500 ? 'Internal server error' : err.message;

  if (status === 500) {
    console.error(err);
  }

  return sendError(res, status, message, code);
};

module.exports = {
  notFound,
  errorHandler,
};
