const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateSpecialistProfile } = require('../utils/validators');

router.use(requireAuth, requireAdmin);

router.put('/:id/profile', validateSpecialistProfile, customerController.updateSpecialistProfile);

module.exports = router;

