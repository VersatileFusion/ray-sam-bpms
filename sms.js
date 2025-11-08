const { Smsir } = require("smsir-js");
const User = require('./models/User');
const Customer = require('./models/Customer');

// Load from environment variables for security
const SMS_API_KEY = process.env.SMS_API_KEY;
const LINE_NUMBER = parseInt(process.env.SMS_LINE_NUMBER) || 30004802149089;

// Check if SMS is configured
if (!SMS_API_KEY) {
  console.warn('⚠️  SMS_API_KEY not configured. SMS notifications will be disabled.');
}

const smsir = SMS_API_KEY ? new Smsir(SMS_API_KEY, LINE_NUMBER) : null;

async function sendSMSToAllUsers(message) {
  console.log('📱 sendSMSToAllUsers invoked with message:', message)
  if (!smsir) {
    console.log('📱 SMS not configured, skipping notification')
    return
  }

  if (!message || !message.trim()) {
    console.error('SMS.ir error: message is empty')
    return
  }
  
  try {
    const internalUsers = await User.find({
      role: { $in: ['admin', 'user', 'specialist'] },
      phone: { $exists: true, $ne: null }
    })
    console.log('📱 Found internal recipients:', internalUsers.map(user => ({ name: user.name, role: user.role, phone: user.phone })))

    const phoneNumbers = internalUsers
      .map(user => user.phone)
      .filter(phone => phone && phone.trim())

    const fallbackList = process.env.SMS_RECIPIENTS ? process.env.SMS_RECIPIENTS.split(',') : []
    const recipients = [...new Set([
      ...phoneNumbers,
      ...fallbackList
        .map(num => num && num.trim())
        .filter(Boolean)
    ])]

    if (recipients.length === 0) {
      console.log('📱 No phone numbers found to send SMS to')
      return
    }
    
    console.log('📱 Sending SMS to recipients:', recipients)
    const res = await smsir.SendBulk(message, recipients, null, LINE_NUMBER)
    if (res && res.data && res.data.status === 1) {
      console.log('✅ SMS.ir success:', res.data)
    } else if (res && res.status === 1) {
      console.log('✅ SMS.ir success:', res)
    } else {
      console.error(
        '❌ SMS.ir error:',
        res && res.data ? res.data.message : (res ? res.message : 'No response data'),
        res
      )
    }
  } catch (err) {
    console.error(
      '❌ SMS send error:',
      err.response ? err.response.data : err.message
    )
  }
}

async function sendSMSToSingleUser(message, phoneNumber) {
  console.log('📱 sendSMSToSingleUser invoked with message:', message, 'phone:', phoneNumber)
  if (!smsir) {
    console.log('📱 SMS not configured, skipping notification')
    return
  }

  if (!message || !message.trim()) {
    console.error('SMS.ir error: message is empty')
    return
  }

  if (!phoneNumber || !phoneNumber.trim()) {
    console.error('SMS.ir error: phone number is empty')
    return
  }
  
  try {
    console.log('📱 Sending single SMS to:', phoneNumber)
    const res = await smsir.SendBulk(message, [phoneNumber], null, LINE_NUMBER)
    if (res && res.data && res.data.status === 1) {
      console.log('✅ SMS.ir success:', res.data)
    } else if (res && res.status === 1) {
      console.log('✅ SMS.ir success:', res)
    } else {
      console.error(
        '❌ SMS.ir error:',
        res && res.data ? res.data.message : (res ? res.message : 'No response data'),
        res
      )
    }
  } catch (err) {
    console.error(
      '❌ SMS send error:',
      err.response ? err.response.data : err.message
    )
  }
}

async function sendSMSToCustomers(message, { includeNonPrimary = false } = {}) {
  console.log('📱 sendSMSToCustomers invoked with message:', message)
  if (!smsir) {
    console.log('📱 SMS not configured, skipping notification')
    return
  }

  if (!message || !message.trim()) {
    console.error('SMS.ir error: message is empty')
    return
  }

  try {
    const customers = await Customer.find({
      'contacts.phone': { $exists: true, $ne: null }
    }).select('name status contacts')

    const customerNumbers = new Set()

    customers.forEach(customer => {
      (customer.contacts || []).forEach(contact => {
        const phone = contact?.phone?.trim()
        if (!phone) return
        if (!includeNonPrimary && contact.isPrimary === false) return
        customerNumbers.add(phone)
      })
    })

    const fallbackList = process.env.SMS_CUSTOMER_RECIPIENTS ? process.env.SMS_CUSTOMER_RECIPIENTS.split(',') : []
    fallbackList
      .map(num => num && num.trim())
      .filter(Boolean)
      .forEach(num => customerNumbers.add(num))

    if (customerNumbers.size === 0) {
      console.log('📱 No customer phone numbers found to send SMS to')
      return
    }

    const recipients = Array.from(customerNumbers)
    console.log('📱 Sending SMS to customer recipients:', recipients)
    const res = await smsir.SendBulk(message, recipients, null, LINE_NUMBER)
    if (res && res.data && res.data.status === 1) {
      console.log('✅ SMS.ir success (customers):', res.data)
    } else if (res && res.status === 1) {
      console.log('✅ SMS.ir success (customers):', res)
    } else {
      console.error(
        '❌ SMS.ir error (customers):',
        res && res.data ? res.data.message : (res ? res.message : 'No response data'),
        res
      )
    }
  } catch (err) {
    console.error(
      '❌ SMS send error (customers):',
      err.response ? err.response.data : err.message
    )
  }
}

module.exports = { sendSMSToAllUsers, sendSMSToSingleUser, sendSMSToCustomers };
