const ActivityLog = require('../models/ActivityLog');

/**
 * Log activity for a request
 */
async function logActivity(requestId, action, description, performedBy, changes = {}, oldValue = null, newValue = null, metadata = {}) {
  try {
    await ActivityLog.create({
      requestId,
      action,
      description,
      changes,
      performedBy: {
        userId: performedBy.userId || performedBy._id,
        name: performedBy.name,
        username: performedBy.username
      },
      oldValue,
      newValue,
      metadata
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - activity logging should not break the main flow
  }
}

/**
 * Create activity log helper for common actions
 */
const activityLogger = {
  async created(request, user) {
    return logActivity(
      request._id,
      'created',
      `درخواست ایجاد شد`,
      user,
      {},
      null,
      { status: request.status, priority: request.priority }
    );
  },

  async updated(request, user, changes) {
    const description = Object.keys(changes).length > 0
      ? `فیلدهای ${Object.keys(changes).join(', ')} به‌روزرسانی شد`
      : 'درخواست به‌روزرسانی شد';
    
    return logActivity(
      request._id,
      'updated',
      description,
      user,
      changes
    );
  },

  async statusChanged(request, user, oldStatus, newStatus) {
    return logActivity(
      request._id,
      'status_changed',
      `وضعیت از "${oldStatus}" به "${newStatus}" تغییر کرد`,
      user,
      { status: { from: oldStatus, to: newStatus } },
      oldStatus,
      newStatus
    );
  },

  async assigned(request, user, assignedToUser) {
    return logActivity(
      request._id,
      'assigned',
      assignedToUser 
        ? `درخواست به ${assignedToUser.name} اختصاص داده شد`
        : 'درخواست اختصاص داده شد',
      user,
      {},
      null,
      assignedToUser ? { name: assignedToUser.name, userId: assignedToUser.userId || assignedToUser._id } : null
    );
  },

  async unassigned(request, user) {
    return logActivity(
      request._id,
      'unassigned',
      'اختصاص درخواست حذف شد',
      user
    );
  },

  async commentAdded(request, user, comment) {
    return logActivity(
      request._id,
      'comment_added',
      'نظر جدید اضافه شد',
      user,
      {},
      null,
      { comment: comment.substring(0, 100) }
    );
  },

  async attachmentAdded(request, user, attachment) {
    return logActivity(
      request._id,
      'attachment_added',
      `فایل "${attachment.originalName}" اضافه شد`,
      user,
      {},
      null,
      { filename: attachment.originalName, size: attachment.size }
    );
  },

  async attachmentDeleted(request, user, filename) {
    return logActivity(
      request._id,
      'attachment_deleted',
      `فایل "${filename}" حذف شد`,
      user
    );
  },

  async priorityChanged(request, user, oldPriority, newPriority) {
    return logActivity(
      request._id,
      'priority_changed',
      `اولویت از "${oldPriority}" به "${newPriority}" تغییر کرد`,
      user,
      { priority: { from: oldPriority, to: newPriority } },
      oldPriority,
      newPriority
    );
  },

  async closed(request, user, closeDescription) {
    return logActivity(
      request._id,
      'closed',
      'درخواست بسته شد',
      user,
      {},
      null,
      { closeDescription }
    );
  },

  async reopened(request, user) {
    return logActivity(
      request._id,
      'reopened',
      'درخواست مجدداً باز شد',
      user
    );
  }
};

module.exports = activityLogger;

