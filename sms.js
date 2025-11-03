const { Smsir } = require("smsir-js");
const User = require('./models/User');

// Load from environment variables for security
const SMS_API_KEY = process.env.SMS_API_KEY;
const LINE_NUMBER = parseInt(process.env.SMS_LINE_NUMBER) || 30004802149089;

// Check if SMS is configured
if (!SMS_API_KEY) {
  console.warn('⚠️  SMS_API_KEY not configured. SMS notifications will be disabled.');
}

const smsir = SMS_API_KEY ? new Smsir(SMS_API_KEY, LINE_NUMBER) : null;

async function sendSMSToAllUsers(message) {
  // Skip if SMS not configured
  if (!smsir) {
    console.log('📱 SMS not configured, skipping notification');
    return;
  }

  if (!message || !message.trim()) {
    console.error("SMS.ir error: message is empty");
    return;
  }
  
  try {
    // Get all admin and user phone numbers from database
    const adminUsers = await User.find({ role: { $in: ['admin', 'user'] }, phone: { $exists: true, $ne: null } });
    const phoneNumbers = adminUsers.map(user => user.phone).filter(phone => phone && phone.trim());
    
    // Fallback to env variable if no phone numbers found in DB
    const recipients = phoneNumbers.length > 0 
      ? phoneNumbers 
      : (process.env.SMS_RECIPIENTS ? process.env.SMS_RECIPIENTS.split(',') : []);
    
    if (recipients.length === 0) {
      console.log('📱 No phone numbers found to send SMS to');
      return;
    }
    
    const res = await smsir.SendBulk(
      message,
      recipients,
      null,
      LINE_NUMBER
    );
    // Handle axios response format
    if (res && res.data && res.data.status === 1) {
      console.log("✅ SMS.ir success:", res.data);
    } else if (res && res.status === 1) {
      // Fallback for direct response format
      console.log("✅ SMS.ir success:", res);
    } else {
      console.error(
        "❌ SMS.ir error:",
        res && res.data ? res.data.message : (res ? res.message : "No response data"),
        res
      );
    }
  } catch (err) {
    console.error(
      "❌ SMS send error:",
      err.response ? err.response.data : err.message
    );
  }
}

async function sendSMSToSingleUser(message, phoneNumber) {
  // Skip if SMS not configured
  if (!smsir) {
    console.log('📱 SMS not configured, skipping notification');
    return;
  }

  if (!message || !message.trim()) {
    console.error("SMS.ir error: message is empty");
    return;
  }

  if (!phoneNumber || !phoneNumber.trim()) {
    console.error("SMS.ir error: phone number is empty");
    return;
  }
  
  try {
    // Use SendBulk for single message as well (it handles both cases)
    const res = await smsir.SendBulk(message, [phoneNumber], null, LINE_NUMBER);
    // Handle axios response format
    if (res && res.data && res.data.status === 1) {
      console.log("✅ SMS.ir success:", res.data);
    } else if (res && res.status === 1) {
      // Fallback for direct response format
      console.log("✅ SMS.ir success:", res);
    } else {
      console.error(
        "❌ SMS.ir error:",
        res && res.data ? res.data.message : (res ? res.message : "No response data"),
        res
      );
    }
  } catch (err) {
    console.error(
      "❌ SMS send error:",
      err.response ? err.response.data : err.message
    );
  }
}

module.exports = { sendSMSToAllUsers, sendSMSToSingleUser };
