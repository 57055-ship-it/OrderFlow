const errorHandler = (err, req, res, next) => {
  console.error('[Global API Error]', err.stack || err.message);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for field '${field}'. Must be unique.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with ID '${err.value}'`;
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
