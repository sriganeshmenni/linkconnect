const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., user_toggle, user_reset_password, user_force_logout, link_toggle, rate_limit_update
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetLink: { type: mongoose.Schema.Types.ObjectId, ref: 'Link' },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

adminAuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
