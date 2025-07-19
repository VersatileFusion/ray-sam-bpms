const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  date: { type: String, required: true }, // تاریخ
  customerName: { type: String, required: true }, // نام مشتری
  userName: { type: String, required: true }, // نام کاربر
  system: { type: String, required: true }, // سیستم
  request: { type: String, required: true }, // درخواست
  requestType: { type: String, required: true }, // نوع درخواست
  actionDescription: { type: String, required: true }, // شرح اقدام
  closeDescription: { type: String }, // شرح بستن درخواست (optional)
  status: {
    type: String,
    enum: ["انجام", "باز", "در درست اقدام"], // بررسی
    required: true,
  },
});

module.exports = mongoose.model("Request", requestSchema);
