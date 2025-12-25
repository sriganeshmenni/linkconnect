const mongoose = require('mongoose');

const VisitStatSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    total: { type: Number, default: 0 },
    byRole: {
      admin: { type: Number, default: 0 },
      faculty: { type: Number, default: 0 },
      student: { type: Number, default: 0 },
      guest: { type: Number, default: 0 },
      unknown: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VisitStat', VisitStatSchema);
