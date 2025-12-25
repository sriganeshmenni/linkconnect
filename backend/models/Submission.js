const mongoose = require('mongoose');

// Aligned with frontend expectations and controller logic
const submissionSchema = new mongoose.Schema({
  // Reference to link
  link: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true
  },
  // Reference to student user
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Base64 or URL of the screenshot proof
  screenshot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'verified'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate submissions per student per link (explicitly named to avoid legacy mismatches)
submissionSchema.index({ link: 1, student: 1 }, { unique: true, name: 'link_1_student_1' });

module.exports = mongoose.model('Submission', submissionSchema);


