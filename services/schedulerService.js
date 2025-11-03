const cron = require('node-cron');
const ScheduledReport = require('../models/ScheduledReport');
const Request = require('../models/Request');
const ExportHistory = require('../models/ExportHistory');
const XLSX = require('xlsx');
const { jalaliToGregorian } = require('../utils/dateHelper');
const nodemailer = require('nodemailer'); // Optional: for email delivery

// Build query from filters
function buildQueryFromFilters(filters, userId) {
  const query = {};

  // Apply customer filter if needed
  if (userId) {
    // In scheduled reports, filters are already applied, but we check user context
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.system) {
    query.system = filters.system;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.assignedTo) {
    query['assignedTo.userId'] = filters.assignedTo;
  }

  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: filters.startDate,
      $lte: filters.endDate
    };
  } else if (filters.startDate) {
    query.date = { $gte: filters.startDate };
  } else if (filters.endDate) {
    query.date = { $lte: filters.endDate };
  }

  if (filters.customerName) {
    query.customerName = { $regex: filters.customerName, $options: 'i' };
  }

  return query;
}

// Generate export file
async function generateExport(report, requests) {
  try {
    const filename = `${report.name}_${new Date().toISOString().split('T')[0]}`;
    
    if (report.type === 'excel') {
      const excelData = requests.map(req => ({
        'تاریخ': formatDateForExport(req.date),
        'نام مشتری': req.customerName || '',
        'شماره تماس': req.customerPhone || '',
        'نام کاربر': req.userName || '',
        'سیستم': req.system || '',
        'نوع درخواست': req.requestType || '',
        'درخواست': req.request || '',
        'وضعیت': req.status || '',
        'اولویت': req.priority || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'درخواست‌ها');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return { buffer, filename: `${filename}.xlsx`, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    } else if (report.type === 'csv') {
      const headers = ['تاریخ', 'نام مشتری', 'شماره تماس', 'سیستم', 'درخواست', 'وضعیت', 'اولویت'];
      const rows = requests.map(req => [
        formatDateForExport(req.date),
        req.customerName || '',
        req.customerPhone || '',
        req.system || '',
        req.request || '',
        req.status || '',
        req.priority || ''
      ]);

      const csvRows = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ];

      const csv = csvRows.join('\n');
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csv;
      const buffer = Buffer.from(csvWithBOM, 'utf-8');
      
      return { buffer, filename: `${filename}.csv`, contentType: 'text/csv; charset=utf-8' };
    }
    
    // Advanced report - similar to Excel but with multiple sheets
    const workbook = XLSX.utils.book_new();
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
      XLSX.utils.book_append_sheet(workbook, sheet, status.substring(0, 31));
    });

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return { buffer, filename: `${filename}.xlsx`, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
  } catch (error) {
    console.error('Generate export error:', error);
    throw error;
  }
}

// Format date for export
function formatDateForExport(date) {
  if (!date) return '';
  
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
      return date;
    }
    return date;
  }
  
  if (date instanceof Date) {
    const jalali = require('jalali-moment');
    return jalali(date).format('jYYYY/jMM/jDD');
  }
  
  return String(date);
}

// Process scheduled report
async function processScheduledReport(report) {
  try {
    console.log(`Processing scheduled report: ${report.name} (ID: ${report._id})`);
    
    // Build query from filters
    const query = buildQueryFromFilters(report.filters || {}, report.createdBy.userId);
    
    // Get requests
    const requests = await Request.find(query).sort({ createdAt: -1 });
    
    // Generate export
    const { buffer, filename, contentType } = await generateExport(report, requests);
    
    // Log export history
    await ExportHistory.create({
      exportType: report.type,
      filename,
      filters: report.filters || {},
      recordCount: requests.length,
      fileSize: buffer.length,
      status: 'success',
      exportedBy: {
        userId: report.createdBy.userId,
        name: report.createdBy.name,
        username: ''
      },
      downloadUrl: '', // In real implementation, save file and store URL
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    
    // Update report
    report.lastRun = new Date();
    report.runCount = (report.runCount || 0) + 1;
    report.nextRun = report.calculateNextRun();
    await report.save();
    
    console.log(`Scheduled report processed successfully: ${report.name}`);
    
    // TODO: Send email to recipients if configured
    // await sendReportToRecipients(report, buffer, filename, contentType);
    
    return { success: true, requestsCount: requests.length };
  } catch (error) {
    console.error(`Error processing scheduled report ${report._id}:`, error);
    
    // Log failed export
    await ExportHistory.create({
      exportType: report.type,
      filename: `${report.name}_${new Date().toISOString().split('T')[0]}`,
      filters: report.filters || {},
      status: 'failed',
      error: error.message,
      exportedBy: {
        userId: report.createdBy.userId,
        name: report.createdBy.name,
        username: ''
      }
    }).catch(err => console.error('Error logging failed export:', err));
    
    return { success: false, error: error.message };
  }
}

// Initialize scheduler
function initializeScheduler() {
  console.log('Initializing scheduled reports scheduler...');
  
  // Run every minute to check for scheduled reports
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const reports = await ScheduledReport.find({
        isActive: true,
        nextRun: { $lte: now }
      }).populate('createdBy.userId');
      
      for (const report of reports) {
        await processScheduledReport(report);
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  });
  
  console.log('Scheduled reports scheduler initialized');
}

module.exports = {
  initializeScheduler,
  processScheduledReport
};

