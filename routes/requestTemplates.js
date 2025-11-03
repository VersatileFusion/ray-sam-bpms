const express = require('express');
const router = express.Router();
const templateController = require('../controllers/requestTemplateController');
const { requireAuth } = require('../middleware/auth');

// Get all templates
router.get('/', requireAuth, templateController.getAllTemplates);

// Get single template
router.get('/:id', requireAuth, templateController.getTemplate);

// Create template
router.post('/', requireAuth, templateController.createTemplate);

// Update template
router.put('/:id', requireAuth, templateController.updateTemplate);

// Delete template
router.delete('/:id', requireAuth, templateController.deleteTemplate);

module.exports = router;

