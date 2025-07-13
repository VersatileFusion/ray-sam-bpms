const { Smsir } = require('smsir-js');

const SMS_API_KEY = 'xevIdRFFOQQKj6JeiXSHfXZCBpFWqzauoIc3uzQdeePUUe2q';
const LINE_NUMBER = 30004802149089; // as a number, not string
const USERS_PHONE_NUMBERS = ['09109924707']; // no +98, just 09...

const smsir = new Smsir(SMS_API_KEY, LINE_NUMBER);

async function sendSMSToAllUsers(message) {
  if (!message || !message.trim()) {
    console.error('SMS.ir error: message is empty');
    return;
  }
  try {
    const res = await smsir.SendBulk(message, USERS_PHONE_NUMBERS, null, LINE_NUMBER);
    if (res && res.status === 1) {
      console.log('SMS.ir success:', res);
    } else {
      console.error('SMS.ir error:', res ? res.message : 'No response data', res);
    }
  } catch (err) {
    console.error('SMS send error:', err.response ? err.response.data : err.message);
  }
}

module.exports = { sendSMSToAllUsers };
