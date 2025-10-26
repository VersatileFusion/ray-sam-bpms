const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { validateLogin } = require('../utils/validators');

// Login
router.post('/login', loginLimiter, validateLogin, authController.login);

// Logout
router.post('/logout', authController.logout);

// Get current user
router.get('/me', authController.getMe);

// Change password
router.post('/change-password', requireAuth, authController.changePassword);

module.exports = router;

