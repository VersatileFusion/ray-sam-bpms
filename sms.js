const { Smsir } = require("smsir-js");

// Load from environment variables for security
const SMS_API_KEY = process.env.SMS_API_KEY;
const LINE_NUMBER = parseInt(process.env.SMS_LINE_NUMBER) || 30004802149089;
const USERS_PHONE_NUMBERS = process.env.SMS_RECIPIENTS 
  ? process.env.SMS_RECIPIENTS.split(',') 
  : ["09109924707"];

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
    const res = await smsir.SendBulk(
      message,
      USERS_PHONE_NUMBERS,
      null,
      LINE_NUMBER
    );
    if (res && res.status === 1) {
      console.log("✅ SMS.ir success:", res);
    } else {
      console.error(
        "❌ SMS.ir error:",
        res ? res.message : "No response data",
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

module.exports = { sendSMSToAllUsers };
