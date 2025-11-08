const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Request = require('../models/Request');
const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, PAGINATION, CUSTOMER_STATUS } = require('../config/constants');

/**
 * Build customer query filters from request parameters
 */
function buildCustomerFilters(query) {
  const filters = {};

  if (query.search) {
    filters.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { companyName: { $regex: query.search, $options: 'i' } },
      { tags: { $regex: query.search, $options: 'i' } },
      { 'contacts.email': { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } }
    ];
  }

  if (query.status) {
    filters.status = query.status;
  }

  if (query.tier) {
    filters.tier = query.tier;
  }

  if (query.tag) {
    filters.tags = query.tag;
  }

  if (query.specialistId && mongoose.Types.ObjectId.isValid(query.specialistId)) {
    filters.assignedSpecialists = query.specialistId;
  }

  return filters;
}

/**
 * Paginated list of customers
 */
exports.listCustomers = async (req, res) => {
  try {
    const filters = buildCustomerFilters(req.query);
    const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const [total, customers] = await Promise.all([
      Customer.countDocuments(filters),
      Customer.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('assignedSpecialists', 'name role specialistProfile')
    ]);

    sendPaginated(res, customers, page, limit, total);
  } catch (error) {
    console.error('List customers error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Get single customer
 */
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedSpecialists', 'name role specialistProfile skills tags')
      .lean();

    if (!customer) {
      return sendError(res, ERROR_MESSAGES.CUSTOMER_NOT_FOUND, 404);
    }

    sendSuccess(res, { customer });
  } catch (error) {
    console.error('Get customer error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Create new customer
 */
exports.createCustomer = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (!payload.code) {
      payload.code = `CUS-${Date.now()}`;
    }

    payload.createdBy = {
      userId: req.session.user._id,
      name: req.session.user.name
    };

    payload.updatedBy = {
      userId: req.session.user._id,
      name: req.session.user.name
    };

    if (payload.contacts?.length) {
      payload.contacts = payload.contacts.map(contact => ({
        ...contact,
        isPrimary: contact.isPrimary || false
      }));
    }

    const customer = new Customer(payload);
    const savedCustomer = await customer.save();

    // Update specialist assignments
    if (payload.assignedSpecialists?.length) {
      await User.updateMany(
        { _id: { $in: payload.assignedSpecialists } },
        { $addToSet: { assignedCustomers: savedCustomer._id } }
      );
    }

    sendSuccess(res, { customer: savedCustomer }, SUCCESS_MESSAGES.CUSTOMER_CREATED, 201);
  } catch (error) {
    console.error('Create customer error:', error);
    if (error.code === 11000) {
      return sendError(res, 'کد مشتری تکراری است', 400);
    }
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Update customer details
 */
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return sendError(res, ERROR_MESSAGES.CUSTOMER_NOT_FOUND, 404);
    }

    const previousSpecialists = customer.assignedSpecialists?.map(id => id.toString()) || [];
    const payload = { ...req.body };

    payload.updatedBy = {
      userId: req.session.user._id,
      name: req.session.user.name
    };

    if (payload.contacts?.length) {
      payload.contacts = payload.contacts.map(contact => ({
        ...contact,
        isPrimary: contact.isPrimary || false
      }));
    }

    Object.entries(payload).forEach(([key, value]) => {
      customer.set(key, value);
    });

    const updatedCustomer = await customer.save();

    // Synchronize specialist assignments
    if (payload.assignedSpecialists) {
      const newSpecialists = payload.assignedSpecialists.map(id => id.toString());

      const specialistsToAdd = newSpecialists.filter(id => !previousSpecialists.includes(id));
      const specialistsToRemove = previousSpecialists.filter(id => !newSpecialists.includes(id));

      if (specialistsToAdd.length) {
        await User.updateMany(
          { _id: { $in: specialistsToAdd } },
          { $addToSet: { assignedCustomers: customer._id } }
        );
      }

      if (specialistsToRemove.length) {
        await User.updateMany(
          { _id: { $in: specialistsToRemove } },
          { $pull: { assignedCustomers: customer._id } }
        );
      }
    }

    sendSuccess(res, { customer: updatedCustomer }, SUCCESS_MESSAGES.CUSTOMER_UPDATED);
  } catch (error) {
    console.error('Update customer error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Archive (soft delete) customer
 */
exports.archiveCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return sendError(res, ERROR_MESSAGES.CUSTOMER_NOT_FOUND, 404);
    }

    customer.status = CUSTOMER_STATUS.INACTIVE;
    customer.updatedBy = {
      userId: req.session.user._id,
      name: req.session.user.name
    };

    await customer.save();

    sendSuccess(res, {}, 'مشتری غیرفعال شد');
  } catch (error) {
    console.error('Archive customer error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Get insights for a customer (requests summary, SLA, etc.)
 */
exports.getCustomerInsights = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId).lean();

    if (!customer) {
      return sendError(res, ERROR_MESSAGES.CUSTOMER_NOT_FOUND, 404);
    }

    const requestQuery = { $or: [{ customer: customer._id }, { 'customerSnapshot.name': customer.name }] };

    const [total, open, inProgress, completed, recentRequests] = await Promise.all([
      Request.countDocuments(requestQuery),
      Request.countDocuments({ ...requestQuery, status: 'باز' }),
      Request.countDocuments({ ...requestQuery, status: 'در درست اقدام' }),
      Request.countDocuments({ ...requestQuery, status: 'انجام' }),
      Request.find(requestQuery).sort({ createdAt: -1 }).limit(10)
    ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    sendSuccess(res, {
      customer,
      summary: {
        total,
        open,
        inProgress,
        completed,
        completionRate
      },
      recentRequests
    });
  } catch (error) {
    console.error('Customer insights error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Update specialist profile for a user
 */
exports.updateSpecialistProfile = async (req, res) => {
  try {
    const { specialistProfile, role, name, email, phone, jobTitle, department, skills, tags } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    if (role) {
      user.role = role;
    }

    if (name) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (department !== undefined) user.department = department;
    if (skills !== undefined) user.skills = skills;
    if (tags !== undefined) user.tags = tags;

    if (specialistProfile) {
      user.specialistProfile = {
        ...user.specialistProfile?.toObject?.(),
        ...specialistProfile
      };
    }

    await user.save();

    sendSuccess(res, { user }, 'اطلاعات متخصص به‌روزرسانی شد');
  } catch (error) {
    console.error('Update specialist profile error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

module.exports = {
  listCustomers: exports.listCustomers,
  getCustomerById: exports.getCustomerById,
  createCustomer: exports.createCustomer,
  updateCustomer: exports.updateCustomer,
  archiveCustomer: exports.archiveCustomer,
  getCustomerInsights: exports.getCustomerInsights,
  updateSpecialistProfile: exports.updateSpecialistProfile
};

