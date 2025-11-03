const Request = require('../models/Request');
const ExportHistory = require('../models/ExportHistory');
const XLSX = require('xlsx');
const { sendSuccess, sendError } = require('../utils/response');
const { ERROR_MESSAGES } = require('../config/constants');
const { jalaliToGregorian } = require('../utils/dateHelper');

// Export requests to Excel
exports.exportToExcel = async (req, res) => {
  try {
    const query = buildQuery(req);
    const requests = await Request.find(query).sort({ createdAt: -1 });

    // Prepare data for Excel
    const excelData = requests.map(req => ({
      'تاریخ': formatDateForExport(req.date),
      'نام مشتری': req.customerName || '',
      'شماره تماس': req.customerPhone || '',
      'نام کاربر': req.userName || '',
      'سیستم': req.system || '',
      'نوع درخواست': req.requestType || '',
      'درخواست': req.request || '',
      'شرح اقدام': req.actionDescription || '',
      'شرح بستن': req.closeDescription || '',
      'وضعیت': req.status || '',
      'اولویت': req.priority || '',
      'تاریخ سررسید': req.dueDate ? formatDateForExport(req.dueDate) : '',
      'اختصاص داده شده به': req.assignedTo?.name || '',
      'ایجاد کننده': req.createdBy?.name || '',
      'آخرین ویرایش': req.lastModifiedBy?.name || '',
      'تاریخ ایجاد': req.createdAt ? formatDateForExport(req.createdAt) : '',
      'تاریخ آخرین تغییر': req.updatedAt ? formatDateForExport(req.updatedAt) : ''
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'درخواست‌ها');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers
    const filename = `درخواست‌ها_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    
    res.send(buffer);
    
    // Log export history
    await logExportHistory(req, 'excel', filename, buffer.length, requests.length, query);
  } catch (error) {
    console.error('Export to Excel error:', error);
    await ExportHistory.create({
      exportType: 'excel',
      filename: `درخواست‌ها_${new Date().toISOString().split('T')[0]}.xlsx`,
      filters: buildQuery(req),
      status: 'failed',
      error: error.message,
      exportedBy: {
        userId: req.session.user?._id,
        name: req.session.user?.name,
        username: req.session.user?.username
      }
    }).catch(err => console.error('Error logging failed export:', err));
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Export requests to CSV
exports.exportToCSV = async (req, res) => {
  try {
    const query = buildQuery(req);
    const requests = await Request.find(query).sort({ createdAt: -1 });

    // Prepare CSV headers
    const headers = [
      'تاریخ', 'نام مشتری', 'شماره تماس', 'نام کاربر', 'سیستم', 'نوع درخواست',
      'درخواست', 'شرح اقدام', 'شرح بستن', 'وضعیت', 'اولویت', 'تاریخ سررسید',
      'اختصاص داده شده به', 'ایجاد کننده', 'آخرین ویرایش'
    ];

    // Prepare CSV rows
    const rows = requests.map(req => [
      formatDateForExport(req.date),
      req.customerName || '',
      req.customerPhone || '',
      req.userName || '',
      req.system || '',
      req.requestType || '',
      req.request || '',
      req.actionDescription || '',
      req.closeDescription || '',
      req.status || '',
      req.priority || '',
      req.dueDate ? formatDateForExport(req.dueDate) : '',
      req.assignedTo?.name || '',
      req.createdBy?.name || '',
      req.lastModifiedBy?.name || ''
    ]);

    // Convert to CSV format
    const csvRows = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ];

    const csv = csvRows.join('\n');
    
    // Add BOM for UTF-8 with Persian support
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csv;

    // Set headers
    const filename = `درخواست‌ها_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    
    res.send(csvWithBOM);
    
    // Log export history
    await logExportHistory(req, 'csv', filename, Buffer.byteLength(csvWithBOM), requests.length, query);
  } catch (error) {
    console.error('Export to CSV error:', error);
    await ExportHistory.create({
      exportType: 'csv',
      filename: `درخواست‌ها_${new Date().toISOString().split('T')[0]}.csv`,
      filters: buildQuery(req),
      status: 'failed',
      error: error.message,
      exportedBy: {
        userId: req.session.user?._id,
        name: req.session.user?.name,
        username: req.session.user?.username
      }
    }).catch(err => console.error('Error logging failed export:', err));
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Export requests to Excel with multiple sheets (advanced report)
exports.exportAdvancedReport = async (req, res) => {
  try {
    const query = buildQuery(req);
    const requests = await Request.find(query).sort({ createdAt: -1 });

    const workbook = XLSX.utils.book_new();

    // Sheet 1: All Requests
    const allData = requests.map(req => ({
      'تاریخ': formatDateForExport(req.date),
      'نام مشتری': req.customerName || '',
      'سیستم': req.system || '',
      'وضعیت': req.status || '',
      'اولویت': req.priority || '',
      'درخواست': req.request || ''
    }));
    const sheet1 = XLSX.utils.json_to_sheet(allData);
    XLSX.utils.book_append_sheet(workbook, sheet1, 'همه درخواست‌ها');

    // Sheet 2: By Status
    const byStatus = {};
    requests.forEach(req => {
      const status = req.status || 'نامشخص';
      if (!byStatus[status]) byStatus[status] = [];
      byStatus[status].push({
        'تاریخ': formatDateForExport(req.date),
        'نام مشتری': req.customerName || '',
        'سیستم': req.system || '',
        'درخواست': req.request || ''
      });
    });
    
    Object.keys(byStatus).forEach(status => {
      const sheet = XLSX.utils.json_to_sheet(byStatus[status]);
      XLSX.utils.book_append_sheet(workbook, sheet, status);
    });

    // Sheet 3: By System
    const bySystem = {};
    requests.forEach(req => {
      const system = req.system || 'نامشخص';
      if (!bySystem[system]) bySystem[system] = [];
      bySystem[system].push({
        'تاریخ': formatDateForExport(req.date),
        'نام مشتری': req.customerName || '',
        'وضعیت': req.status || '',
        'درخواست': req.request || ''
      });
    });
    
    Object.keys(bySystem).forEach(system => {
      const sheet = XLSX.utils.json_to_sheet(bySystem[system]);
      XLSX.utils.book_append_sheet(workbook, sheet, system.substring(0, 31)); // Excel sheet name limit
    });

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers
    const filename = `گزارش_پیشرفته_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    
    res.send(buffer);
    
    // Log export history
    await logExportHistory(req, 'advanced', filename, buffer.length, requests.length, query);
  } catch (error) {
    console.error('Export advanced report error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Helper function to log export history
async function logExportHistory(req, exportType, filename, fileSize, recordCount, filters) {
  try {
    await ExportHistory.create({
      exportType,
      filename,
      filters,
      recordCount,
      fileSize,
      status: 'success',
      exportedBy: {
        userId: req.session.user._id,
        name: req.session.user.name,
        username: req.session.user.username
      }
    });
  } catch (error) {
    console.error('Error logging export history:', error);
    // Don't fail the export if history logging fails
  }
}

// Helper function to build query from request
function buildQuery(req) {
  const query = {};

  // Apply customer filter
  if (req.session.user.role === 'customer') {
    query['createdBy.userId'] = req.session.user._id;
  }

  // Apply filters from query params
  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.system) {
    query.system = req.query.system;
  }

  if (req.query.priority) {
    query.priority = req.query.priority;
  }

  if (req.query.assignedTo) {
    query['assignedTo.userId'] = req.query.assignedTo;
  }

  if (req.query.startDate && req.query.endDate) {
    query.date = {
      $gte: req.query.startDate,
      $lte: req.query.endDate
    };
  } else if (req.query.startDate) {
    query.date = { $gte: req.query.startDate };
  } else if (req.query.endDate) {
    query.date = { $lte: req.query.endDate };
  }

  if (req.query.customerName) {
    query.customerName = { $regex: req.query.customerName, $options: 'i' };
  }

  return query;
}

// Helper function to format date for export
function formatDateForExport(date) {
  if (!date) return '';
  
  if (typeof date === 'string') {
    // If it's already a Gregorian date string, keep it
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // If it's Jalali format, return as is
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
      return date;
    }
    return date;
  }
  
  if (date instanceof Date) {
    // Convert to Jalali format
    const jalali = require('jalali-moment');
    return jalali(date).format('jYYYY/jMM/jDD');
  }
  
  return String(date);
}

module.exports = exports;

