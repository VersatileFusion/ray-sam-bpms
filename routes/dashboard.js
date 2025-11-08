const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', requireAuth, dashboardController.getDashboardStats);

// Get trends
router.get('/trends', requireAuth, dashboardController.getTrends);

// Get admin overview metrics
router.get('/admin-overview', requireAuth, requireAdmin, dashboardController.getAdminOverview);

module.exports = router;

