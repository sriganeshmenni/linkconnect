const mongoose = require('mongoose');

const rateLimitConfigSchema = new mongoose.Schema({
  windowMs: { type: Number, required: true },
  max: { type: Number, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RateLimitConfig', rateLimitConfigSchema);
