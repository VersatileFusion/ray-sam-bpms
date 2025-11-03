const express = require('express');
const router = express.Router();
const scheduledReportController = require('../controllers/scheduledReportController');
const { requireAuth } = require('../middleware/auth');

// Get all scheduled reports
router.get('/', requireAuth, scheduledReportController.getAllScheduledReports);

// Get single scheduled report
router.get('/:id', requireAuth, scheduledReportController.getScheduledReport);

// Create scheduled report
router.post('/', requireAuth, scheduledReportController.createScheduledReport);

// Update scheduled report
router.put('/:id', requireAuth, scheduledReportController.updateScheduledReport);

// Delete scheduled report
router.delete('/:id', requireAuth, scheduledReportController.deleteScheduledReport);

// Run scheduled report manually
router.post('/:id/run', requireAuth, scheduledReportController.runScheduledReport);

module.exports = router;

