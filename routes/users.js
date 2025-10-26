const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateCreateUser } = require('../utils/validators');

// Get all users
router.get('/', requireAuth, userController.getAllUsers);

// Get user by ID
router.get('/:id', requireAuth, userController.getUserById);

// Create user (admin only)
router.post('/', requireAdmin, validateCreateUser, userController.createUser);

// Update user (admin only)
router.put('/:id', requireAdmin, userController.updateUser);

// Reset password (admin only)
router.post('/:id/reset-password', requireAdmin, userController.resetPassword);

// Delete user (admin only)
router.delete('/:id', requireAdmin, userController.deleteUser);

module.exports = router;

