const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', requireAuth, dashboardController.getDashboardStats);

// Get trends
router.get('/trends', requireAuth, dashboardController.getTrends);

module.exports = router;

