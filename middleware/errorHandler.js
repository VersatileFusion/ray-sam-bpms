const { ERROR_MESSAGES } = require('../config/constants');

// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.BAD_REQUEST
    });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} از قبل وجود دارد`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || ERROR_MESSAGES.SERVER_ERROR
  });
};

// 404 Not Found handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: ERROR_MESSAGES.NOT_FOUND
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};

