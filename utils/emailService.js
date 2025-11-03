const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialize email transporter
 */
function initEmailService() {
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };

  if (emailConfig.auth.user && emailConfig.auth.pass) {
    transporter = nodemailer.createTransport(emailConfig);
    console.log('Email service initialized');
  } else {
    console.warn('Email service not configured - SMTP credentials missing');
  }
}

/**
 * Send email
 */
async function sendEmail(to, subject, text, html = null) {
  if (!transporter) {
    console.warn('Email service not initialized');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"سیستم مدیریت درخواست‌ها" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html: html || text
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send request status change notification
 */
async function sendRequestStatusChangeEmail(request, user, oldStatus, newStatus) {
  if (!request.assignedTo?.userId) return;

  const subject = `تغییر وضعیت درخواست #${request._id}`;
  const text = `
درخواست ${request.request.substring(0, 50)}...
وضعیت آن از "${oldStatus}" به "${newStatus}" تغییر کرده است.

جزئیات:
- مشتری: ${request.customerName}
- سیستم: ${request.system}
- تاریخ: ${request.date}
- اولویت: ${request.priority}

برای مشاهده جزئیات بیشتر به سیستم مراجعه کنید.
  `;

  const html = `
    <div style="font-family: Tahoma, Arial; direction: rtl; text-align: right;">
      <h2>تغییر وضعیت درخواست</h2>
      <p>درخواست <strong>${request.request.substring(0, 50)}...</strong></p>
      <p>وضعیت آن از <strong>"${oldStatus}"</strong> به <strong>"${newStatus}"</strong> تغییر کرده است.</p>
      <hr>
      <h3>جزئیات درخواست:</h3>
      <ul>
        <li><strong>مشتری:</strong> ${request.customerName}</li>
        <li><strong>سیستم:</strong> ${request.system}</li>
        <li><strong>تاریخ:</strong> ${request.date}</li>
        <li><strong>اولویت:</strong> ${request.priority}</li>
      </ul>
      <p><a href="${process.env.APP_URL || 'http://localhost:5000'}/requests/${request._id}">مشاهده جزئیات</a></p>
    </div>
  `;

  // Get assignee email from user model
  const User = require('../models/User');
  const assignee = await User.findById(request.assignedTo.userId);
  
  if (assignee && assignee.email) {
    return sendEmail(assignee.email, subject, text, html);
  }

  return { success: false, error: 'Assignee email not found' };
}

/**
 * Send assignment notification
 */
async function sendAssignmentEmail(request, assignee) {
  if (!assignee.email) return { success: false, error: 'Assignee email not found' };

  const subject = `درخواست جدید به شما اختصاص داده شد #${request._id}`;
  const text = `
درخواست جدیدی به شما اختصاص داده شده است.

جزئیات:
- مشتری: ${request.customerName}
- سیستم: ${request.system}
- درخواست: ${request.request}
- اولویت: ${request.priority}
- وضعیت: ${request.status}

لطفاً در اسرع وقت به این درخواست رسیدگی کنید.
  `;

  const html = `
    <div style="font-family: Tahoma, Arial; direction: rtl; text-align: right;">
      <h2>درخواست جدید</h2>
      <p>درخواست جدیدی به شما اختصاص داده شده است.</p>
      <hr>
      <h3>جزئیات درخواست:</h3>
      <ul>
        <li><strong>مشتری:</strong> ${request.customerName}</li>
        <li><strong>سیستم:</strong> ${request.system}</li>
        <li><strong>درخواست:</strong> ${request.request}</li>
        <li><strong>اولویت:</strong> ${request.priority}</li>
        <li><strong>وضعیت:</strong> ${request.status}</li>
      </ul>
      <p><a href="${process.env.APP_URL || 'http://localhost:5000'}/requests/${request._id}">مشاهده و پاسخ</a></p>
    </div>
  `;

  return sendEmail(assignee.email, subject, text, html);
}

/**
 * Send comment notification
 */
async function sendCommentNotification(request, comment, commenter) {
  // Notify assignee and creator
  const User = require('../models/User');
  const emails = [];

  if (request.assignedTo?.userId) {
    const assignee = await User.findById(request.assignedTo.userId);
    if (assignee?.email && assignee._id.toString() !== commenter._id.toString()) {
      emails.push(assignee.email);
    }
  }

  if (request.createdBy?.userId) {
    const creator = await User.findById(request.createdBy.userId);
    if (creator?.email && creator._id.toString() !== commenter._id.toString() && !emails.includes(creator.email)) {
      emails.push(creator.email);
    }
  }

  if (emails.length === 0) return { success: false, error: 'No recipients' };

  const subject = `نظر جدید در درخواست #${request._id}`;
  const text = `${commenter.name} نظر جدیدی اضافه کرده است:\n\n${comment.text}`;
  const html = `
    <div style="font-family: Tahoma, Arial; direction: rtl; text-align: right;">
      <p><strong>${commenter.name}</strong> نظر جدیدی اضافه کرده است:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${comment.text.replace(/\n/g, '<br>')}
      </div>
      <p><a href="${process.env.APP_URL || 'http://localhost:5000'}/requests/${request._id}">مشاهده</a></p>
    </div>
  `;

  return sendEmail(emails, subject, text, html);
}

module.exports = {
  initEmailService,
  sendEmail,
  sendRequestStatusChangeEmail,
  sendAssignmentEmail,
  sendCommentNotification
};

