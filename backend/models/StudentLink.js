const mongoose = require('mongoose');

const studentLinkSchema = new mongoose.Schema({
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  viewed: {
    type: Boolean,
    default: false
  },
  viewedAt: {
    type: Date
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound unique index to prevent duplicate assignments
studentLinkSchema.index({ linkId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('StudentLink', studentLinkSchema);
