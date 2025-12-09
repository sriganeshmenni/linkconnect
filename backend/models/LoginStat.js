const mongoose = require('mongoose');

const loginStatSchema = new mongoose.Schema({
  date: { type: Date, index: true },
  totalLogins: { type: Number, default: 0 },
  roleBreakdown: {
    admin: { type: Number, default: 0 },
    faculty: { type: Number, default: 0 },
    student: { type: Number, default: 0 }
  },
  uniqueUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('LoginStat', loginStatSchema);
