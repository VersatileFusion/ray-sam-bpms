const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  validateCreateCustomer,
  validateUpdateCustomer
} = require('../utils/validators');

router.use(requireAuth, requireAdmin);

router.get('/', customerController.listCustomers);
router.get('/:id', customerController.getCustomerById);
router.get('/:id/insights', customerController.getCustomerInsights);

router.post('/', validateCreateCustomer, customerController.createCustomer);
router.put('/:id', validateUpdateCustomer, customerController.updateCustomer);
router.delete('/:id', customerController.archiveCustomer);

module.exports = router;

