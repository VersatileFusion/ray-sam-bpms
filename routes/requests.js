const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  validateCreateRequest,
  validateUpdateRequest,
  validateComment,
  validatePagination
} = require('../utils/validators');

// Create request
router.post('/', requireAuth, validateCreateRequest, requestController.createRequest);

// Get all requests (with pagination)
router.get('/', requireAuth, validatePagination, requestController.getAllRequests);

// Search requests
router.get('/search', requireAuth, requestController.searchRequests);

// Get request history
router.get('/:id/history', requireAuth, requestController.getRequestHistory);

// Update request
router.put('/:id', requireAuth, validateUpdateRequest, requestController.updateRequest);

// Add comment
router.post('/:id/comments', requireAuth, validateComment, requestController.addComment);

// Upload attachment
router.post('/:id/attachments', requireAuth, upload.single('file'), requestController.uploadAttachment);

// Assign request
router.post('/:id/assign', requireAuth, requestController.assignRequest);

// Bulk update
router.post('/bulk/update', requireAuth, requestController.bulkUpdate);

module.exports = router;

