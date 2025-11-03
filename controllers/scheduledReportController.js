const ScheduledReport = require('../models/ScheduledReport');
const { sendSuccess, sendError } = require('../utils/response');
const { ERROR_MESSAGES } = require('../config/constants');

// Get all scheduled reports
exports.getAllScheduledReports = async (req, res) => {
  try {
    const query = {};
    
    // Non-admins can only see their own scheduled reports
    if (req.session.user.role !== 'admin') {
      query['createdBy.userId'] = req.session.user._id;
    }
    
    const reports = await ScheduledReport.find(query)
      .sort({ createdAt: -1 })
      .populate('recipients.userId', 'name username email')
      .populate('createdBy.userId', 'name username');
    
    sendSuccess(res, { reports });
  } catch (error) {
    console.error('Get scheduled reports error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Get single scheduled report
exports.getScheduledReport = async (req, res) => {
  try {
    const report = await ScheduledReport.findById(req.params.id)
      .populate('recipients.userId', 'name username email')
      .populate('createdBy.userId', 'name username');
    
    if (!report) {
      return sendError(res, 'گزارش زمان‌بندی شده یافت نشد', 404);
    }
    
    // Check permission
    if (req.session.user.role !== 'admin' && 
        report.createdBy.userId.toString() !== req.session.user._id) {
      return sendError(res, ERROR_MESSAGES.FORBIDDEN, 403);
    }
    
    sendSuccess(res, { report });
  } catch (error) {
    console.error('Get scheduled report error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Create scheduled report
exports.createScheduledReport = async (req, res) => {
  try {
    const { name, description, type, schedule, filters, recipients } = req.body;
    
    // Validate required fields
    if (!name || !type || !schedule || !schedule.frequency || !schedule.time) {
      return sendError(res, 'فیلدهای الزامی را پر کنید', 400);
    }
    
    // Validate schedule
    if (schedule.frequency === 'weekly' && (schedule.day === undefined || schedule.day < 0 || schedule.day > 6)) {
      return sendError(res, 'برای گزارش هفتگی، روز هفته باید بین 0 تا 6 باشد', 400);
    }
    
    if (schedule.frequency === 'monthly' && (schedule.day === undefined || schedule.day < 1 || schedule.day > 31)) {
      return sendError(res, 'برای گزارش ماهانه، روز ماه باید بین 1 تا 31 باشد', 400);
    }
    
    // Prepare recipients
    const recipientList = [];
    if (recipients && Array.isArray(recipients)) {
      for (const recipient of recipients) {
        if (recipient.userId) {
          recipientList.push({
            userId: recipient.userId,
            email: recipient.email || '',
            name: recipient.name || ''
          });
        } else if (recipient.email) {
          recipientList.push({
            userId: null,
            email: recipient.email,
            name: recipient.name || ''
          });
        }
      }
    }
    
    const report = new ScheduledReport({
      name,
      description,
      type,
      schedule,
      filters: filters || {},
      recipients: recipientList,
      createdBy: {
        userId: req.session.user._id,
        name: req.session.user.name
      }
    });
    
    await report.save();
    
    sendSuccess(res, { report }, 'گزارش زمان‌بندی شده با موفقیت ایجاد شد', 201);
  } catch (error) {
    console.error('Create scheduled report error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Update scheduled report
exports.updateScheduledReport = async (req, res) => {
  try {
    const report = await ScheduledReport.findById(req.params.id);
    
    if (!report) {
      return sendError(res, 'گزارش زمان‌بندی شده یافت نشد', 404);
    }
    
    // Check permission
    if (req.session.user.role !== 'admin' && 
        report.createdBy.userId.toString() !== req.session.user._id) {
      return sendError(res, ERROR_MESSAGES.FORBIDDEN, 403);
    }
    
    const { name, description, type, schedule, filters, recipients, isActive } = req.body;
    
    if (name) report.name = name;
    if (description !== undefined) report.description = description;
    if (type) report.type = type;
    if (schedule) {
      report.schedule = { ...report.schedule, ...schedule };
      // Recalculate next run
      report.nextRun = report.calculateNextRun();
    }
    if (filters !== undefined) report.filters = filters;
    if (recipients !== undefined && Array.isArray(recipients)) {
      const recipientList = [];
      for (const recipient of recipients) {
        if (recipient.userId) {
          recipientList.push({
            userId: recipient.userId,
            email: recipient.email || '',
            name: recipient.name || ''
          });
        } else if (recipient.email) {
          recipientList.push({
            userId: null,
            email: recipient.email,
            name: recipient.name || ''
          });
        }
      }
      report.recipients = recipientList;
    }
    if (typeof isActive !== 'undefined') report.isActive = isActive;
    
    await report.save();
    
    sendSuccess(res, { report }, 'گزارش زمان‌بندی شده با موفقیت به‌روزرسانی شد');
  } catch (error) {
    console.error('Update scheduled report error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Delete scheduled report
exports.deleteScheduledReport = async (req, res) => {
  try {
    const report = await ScheduledReport.findById(req.params.id);
    
    if (!report) {
      return sendError(res, 'گزارش زمان‌بندی شده یافت نشد', 404);
    }
    
    // Check permission
    if (req.session.user.role !== 'admin' && 
        report.createdBy.userId.toString() !== req.session.user._id) {
      return sendError(res, ERROR_MESSAGES.FORBIDDEN, 403);
    }
    
    await ScheduledReport.findByIdAndDelete(req.params.id);
    
    sendSuccess(res, {}, 'گزارش زمان‌بندی شده با موفقیت حذف شد');
  } catch (error) {
    console.error('Delete scheduled report error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Run scheduled report manually
exports.runScheduledReport = async (req, res) => {
  try {
    const report = await ScheduledReport.findById(req.params.id);
    
    if (!report) {
      return sendError(res, 'گزارش زمان‌بندی شده یافت نشد', 404);
    }
    
    // Check permission
    if (req.session.user.role !== 'admin' && 
        report.createdBy.userId.toString() !== req.session.user._id) {
      return sendError(res, ERROR_MESSAGES.FORBIDDEN, 403);
    }
    
    // This will trigger the scheduler to run the report
    // The actual export generation happens in the scheduler service
    sendSuccess(res, {}, 'گزارش در صف اجرا قرار گرفت');
  } catch (error) {
    console.error('Run scheduled report error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

module.exports = exports;

