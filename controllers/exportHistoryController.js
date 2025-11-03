const ExportHistory = require('../models/ExportHistory');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { ERROR_MESSAGES, PAGINATION } = require('../config/constants');

// Get export history
exports.getExportHistory = async (req, res) => {
  try {
    const query = {};
    
    // Non-admins can only see their own export history
    if (req.session.user.role !== 'admin') {
      query['exportedBy.userId'] = req.session.user._id;
    }
    
    // Filter by export type if provided
    if (req.query.exportType) {
      query.exportType = req.query.exportType;
    }
    
    // Filter by date range if provided
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }
    
    // Pagination
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;
    
    const total = await ExportHistory.countDocuments(query);
    const history = await ExportHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('exportedBy.userId', 'name username');
    
    sendPaginated(res, history, page, limit, total);
  } catch (error) {
    console.error('Get export history error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Get export statistics
exports.getExportStatistics = async (req, res) => {
  try {
    const query = {};
    
    // Non-admins can only see their own statistics
    if (req.session.user.role !== 'admin') {
      query['exportedBy.userId'] = req.session.user._id;
    }
    
    const [
      total,
      byType,
      recent,
      totalSize,
      successCount,
      failedCount
    ] = await Promise.all([
      ExportHistory.countDocuments(query),
      ExportHistory.aggregate([
        { $match: query },
        { $group: { _id: '$exportType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      ExportHistory.find(query)
        .sort({ createdAt: -1 })
        .limit(5),
      ExportHistory.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$fileSize' } } }
      ]),
      ExportHistory.countDocuments({ ...query, status: 'success' }),
      ExportHistory.countDocuments({ ...query, status: 'failed' })
    ]);
    
    sendSuccess(res, {
      total,
      byType: byType.map(item => ({ type: item._id, count: item.count })),
      recent,
      totalSize: totalSize.length > 0 ? totalSize[0].total : 0,
      successCount,
      failedCount,
      successRate: total > 0 ? Math.round((successCount / total) * 100) : 0
    });
  } catch (error) {
    console.error('Get export statistics error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Delete export history entry
exports.deleteExportHistory = async (req, res) => {
  try {
    const history = await ExportHistory.findById(req.params.id);
    
    if (!history) {
      return sendError(res, 'رکورد یافت نشد', 404);
    }
    
    // Check permission
    if (req.session.user.role !== 'admin' && 
        history.exportedBy.userId.toString() !== req.session.user._id) {
      return sendError(res, ERROR_MESSAGES.FORBIDDEN, 403);
    }
    
    await ExportHistory.findByIdAndDelete(req.params.id);
    
    sendSuccess(res, {}, 'رکورد با موفقیت حذف شد');
  } catch (error) {
    console.error('Delete export history error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

module.exports = exports;

