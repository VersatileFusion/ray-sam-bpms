const RequestTemplate = require('../models/RequestTemplate');
const { sendSuccess, sendError } = require('../utils/response');
const { ERROR_MESSAGES } = require('../config/constants');

// Get all templates
exports.getAllTemplates = async (req, res) => {
  try {
    const query = { isActive: true };
    
    // Optionally filter by system
    if (req.query.system) {
      query.system = req.query.system;
    }
    
    const templates = await RequestTemplate.find(query)
      .sort({ usageCount: -1, name: 1 })
      .populate('createdBy.userId', 'name username');
    
    sendSuccess(res, { templates });
  } catch (error) {
    console.error('Get templates error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Get single template
exports.getTemplate = async (req, res) => {
  try {
    const template = await RequestTemplate.findById(req.params.id);
    
    if (!template) {
      return sendError(res, 'الگو یافت نشد', 404);
    }
    
    if (!template.isActive) {
      return sendError(res, 'الگو غیرفعال است', 400);
    }
    
    sendSuccess(res, { template });
  } catch (error) {
    console.error('Get template error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Create template
exports.createTemplate = async (req, res) => {
  try {
    const { name, description, system, requestType, defaultPriority, defaultFields } = req.body;
    
    if (!name || !system || !requestType) {
      return sendError(res, 'فیلدهای الزامی را پر کنید', 400);
    }
    
    const template = new RequestTemplate({
      name,
      description,
      system,
      requestType,
      defaultPriority: defaultPriority || 'متوسط',
      defaultFields: defaultFields || {},
      createdBy: {
        userId: req.session.user._id,
        name: req.session.user.name
      }
    });
    
    await template.save();
    
    sendSuccess(res, { template }, 'الگو با موفقیت ایجاد شد', 201);
  } catch (error) {
    console.error('Create template error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const template = await RequestTemplate.findById(req.params.id);
    
    if (!template) {
      return sendError(res, 'الگو یافت نشد', 404);
    }
    
    // Check permission (only creator or admin can update)
    if (req.session.user.role !== 'admin' &&
        template.createdBy.userId.toString() !== req.session.user._id) {
      return sendError(res, ERROR_MESSAGES.FORBIDDEN, 403);
    }
    
    const { name, description, system, requestType, defaultPriority, defaultFields, isActive } = req.body;
    
    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (system) template.system = system;
    if (requestType) template.requestType = requestType;
    if (defaultPriority) template.defaultPriority = defaultPriority;
    if (defaultFields) template.defaultFields = defaultFields;
    if (typeof isActive !== 'undefined') template.isActive = isActive;
    
    template.updatedAt = new Date();
    await template.save();
    
    sendSuccess(res, { template }, 'الگو با موفقیت به‌روزرسانی شد');
  } catch (error) {
    console.error('Update template error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await RequestTemplate.findById(req.params.id);
    
    if (!template) {
      return sendError(res, 'الگو یافت نشد', 404);
    }
    
    // Check permission
    if (req.session.user.role !== 'admin' &&
        template.createdBy.userId.toString() !== req.session.user._id) {
      return sendError(res, ERROR_MESSAGES.FORBIDDEN, 403);
    }
    
    await RequestTemplate.findByIdAndDelete(req.params.id);
    
    sendSuccess(res, {}, 'الگو با موفقیت حذف شد');
  } catch (error) {
    console.error('Delete template error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Increment usage count
exports.incrementUsage = async (templateId) => {
  try {
    await RequestTemplate.findByIdAndUpdate(templateId, {
      $inc: { usageCount: 1 }
    });
  } catch (error) {
    console.error('Error incrementing template usage:', error);
  }
};

module.exports = exports;

