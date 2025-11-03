const Request = require('../models/Request');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { ERROR_MESSAGES } = require('../config/constants');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const query = {};
    
    // Apply customer filter
    if (req.session.user.role === 'customer') {
      query['createdBy.userId'] = req.session.user._id;
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: req.query.startDate,
        $lte: req.query.endDate
      };
    }

    const [
      total,
      open,
      inProgress,
      completed,
      bySystem,
      byPriority,
      byStatus,
      byDateRange,
      recentRequests
    ] = await Promise.all([
      Request.countDocuments(query),
      Request.countDocuments({ ...query, status: 'باز' }),
      Request.countDocuments({ ...query, status: 'در درست اقدام' }),
      Request.countDocuments({ ...query, status: 'انجام' }),
      Request.aggregate([
        { $match: query },
        { $group: { _id: '$system', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Request.aggregate([
        { $match: query },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Request.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Request.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$date',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 30 }
      ]),
      Request.find(query)
        .sort({ createdAt: -1 })
        .limit(10)
        .select('customerName customerPhone system status date _id')
    ]);

    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate average resolution time (for completed requests)
    const completedRequests = await Request.find({
      ...query,
      status: 'انجام',
      createdAt: { $exists: true },
      updatedAt: { $exists: true }
    }).select('createdAt updatedAt').lean();

    let avgResolutionDays = 0;
    if (completedRequests.length > 0) {
      const totalDays = completedRequests.reduce((sum, req) => {
        if (req.createdAt && req.updatedAt) {
          const createdDate = new Date(req.createdAt);
          const updatedDate = new Date(req.updatedAt);
          const days = Math.ceil((updatedDate - createdDate) / (1000 * 60 * 60 * 24));
          return sum + (days > 0 ? days : 0);
        }
        return sum;
      }, 0);
      avgResolutionDays = totalDays > 0 ? Math.round(totalDays / completedRequests.length) : 0;
    }

    // Requests by assignee
    const byAssignee = await Request.aggregate([
      { $match: { ...query, assignedTo: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$assignedTo.userId',
          name: { $first: '$assignedTo.name' },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'انجام'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    sendSuccess(res, {
      summary: {
        total,
        open,
        inProgress,
        completed,
        completionRate,
        avgResolutionDays
      },
      bySystem: bySystem.map(item => ({ name: item._id, count: item.count })),
      byPriority: byPriority.map(item => ({ name: item._id, count: item.count })),
      byStatus: byStatus.map(item => ({ name: item._id, count: item.count })),
      byDateRange: byDateRange.map(item => ({ date: item._id, count: item.count })),
      byAssignee: byAssignee.map(item => ({
        userId: item._id,
        name: item.name,
        total: item.count,
        completed: item.completed
      })),
      recentRequests
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Get trends (daily, weekly, monthly)
exports.getTrends = async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    const query = {};

    // Apply customer filter
    if (req.session.user.role === 'customer') {
      query['createdBy.userId'] = req.session.user._id;
    }

    // Date range filter
    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    let groupFormat = {};
    let dateFormat = '';

    switch (period) {
      case 'daily':
        groupFormat = {
          year: { $year: { $dateFromString: { dateString: '$date' } } },
          month: { $month: { $dateFromString: { dateString: '$date' } } },
          day: { $dayOfMonth: { $dateFromString: { dateString: '$date' } } }
        };
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'weekly':
        groupFormat = {
          year: { $year: { $dateFromString: { dateString: '$date' } } },
          week: { $week: { $dateFromString: { dateString: '$date' } } }
        };
        dateFormat = 'YYYY-WW';
        break;
      case 'monthly':
        groupFormat = {
          year: { $year: { $dateFromString: { dateString: '$date' } } },
          month: { $month: { $dateFromString: { dateString: '$date' } } }
        };
        dateFormat = 'YYYY-MM';
        break;
    }

    const trends = await Request.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupFormat,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'باز'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'در درست اقدام'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'انجام'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    // Format the results
    const formattedTrends = trends.map(trend => {
      const { _id, ...rest } = trend;
      let dateLabel = '';
      
      if (period === 'daily') {
        dateLabel = `${_id.year}-${String(_id.month).padStart(2, '0')}-${String(_id.day).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        dateLabel = `${_id.year}-W${String(_id.week).padStart(2, '0')}`;
      } else {
        dateLabel = `${_id.year}-${String(_id.month).padStart(2, '0')}`;
      }

      return {
        date: dateLabel,
        ...rest
      };
    });

    sendSuccess(res, { trends: formattedTrends, period });
  } catch (error) {
    console.error('Get trends error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

module.exports = exports;

