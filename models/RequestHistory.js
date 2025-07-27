const mongoose = require("mongoose");

const requestHistorySchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
    required: true,
  },
  changedFields: [
    {
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
    },
  ],
  modifiedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    timestamp: { type: Date, default: Date.now }
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RequestHistory", requestHistorySchema);
