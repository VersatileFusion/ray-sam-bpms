const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');

// Export to Excel
router.get('/export/excel', requireAuth, reportController.exportToExcel);

// Export to CSV
router.get('/export/csv', requireAuth, reportController.exportToCSV);

// Export advanced report (multiple sheets)
router.get('/export/advanced', requireAuth, reportController.exportAdvancedReport);

module.exports = router;

