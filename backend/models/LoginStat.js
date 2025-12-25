const mongoose = require('mongoose');

const loginStatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required because a login attempt might be for a user that doesn't exist yet
    required: false
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],
    // Useful to verify what role the user claimed or actually had at the time
    required: false 
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  failureReason: {
    type: String,
    // Examples: 'invalid_password', 'user_not_found', 'account_inactive'
    default: null
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    // Stores browser/device info (e.g., "Mozilla/5.0...")
    default: 'Unknown'
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'unknown'],
    default: 'unknown'
  },
  loginTime: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 90 // Optional: Automatically delete logs after 90 days to save space
  }
});

// Indexes for faster querying of logs
loginStatSchema.index({ email: 1, loginTime: -1 });
loginStatSchema.index({ userId: 1, loginTime: -1 });
loginStatSchema.index({ ipAddress: 1, loginTime: -1 });

module.exports = mongoose.model('LoginStat', loginStatSchema);