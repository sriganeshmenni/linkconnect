const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
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
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  screenshot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'verified'],
    default: 'completed'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
