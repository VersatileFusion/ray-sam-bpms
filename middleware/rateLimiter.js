const rateLimit = require('express-rate-limit');
const { RATE_LIMITS, ERROR_MESSAGES } = require('../config/constants');

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: RATE_LIMITS.LOGIN.WINDOW_MS,
  max: RATE_LIMITS.LOGIN.MAX_REQUESTS,
  message: {
    success: false,
    message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// Rate limiter for general API calls
const apiLimiter = rateLimit({
  windowMs: RATE_LIMITS.API.WINDOW_MS,
  max: RATE_LIMITS.API.MAX_REQUESTS,
  message: {
    success: false,
    message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

module.exports = {
  loginLimiter,
  apiLimiter
};

