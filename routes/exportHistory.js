const express = require('express');
const router = express.Router();
const exportHistoryController = require('../controllers/exportHistoryController');
const { requireAuth } = require('../middleware/auth');

// Get export history
router.get('/', requireAuth, exportHistoryController.getExportHistory);

// Get export statistics
router.get('/statistics', requireAuth, exportHistoryController.getExportStatistics);

// Delete export history entry
router.delete('/:id', requireAuth, exportHistoryController.deleteExportHistory);

module.exports = router;

