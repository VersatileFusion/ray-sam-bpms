const axios = require("axios");

// sms.ir API details
const SMS_API_URL = "https://api.sms.ir/v1/send/verify";
const SMS_API_KEY = "SkwCNidEz5ChWaLMKKnCn9Bhi2uYknj3Bu5QjvNmwddYAxwF";
const USERS_PHONE_NUMBERS = ["30004802149089"]; // Add all user phone numbers here

async function sendSMSToAllUsers(message) {
  for (const phone of USERS_PHONE_NUMBERS) {
    try {
      await axios.post(
        SMS_API_URL,
        {
          mobile: phone.replace("+98", "0"), // sms.ir expects 09... format
          templateId: 1, // Use a valid templateId or 1 for sandbox
          parameters: [{ name: "code", value: message }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-API-KEY": SMS_API_KEY,
          },
        }
      );
    } catch (err) {
      console.error(
        "SMS send error:",
        err.response ? err.response.data : err.message
      );
    }
  }
}

module.exports = { sendSMSToAllUsers };
