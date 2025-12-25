const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],
    required: true
  },
  rollNumber: {
    type: String,
    required: function() {
      return this.role === 'student';
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  institution: {
    type: String,
    default: 'Aditya'
  },
  collegeCode: {
    type: String,
    default: 'AEC'
  },
  branchCode: {
    type: String,
    default: 'CSE'
  },
  year: {
    type: Number,
    default: 1
  },
  section: {
    type: String,
    default: 'A'
  },
  rollNumber: {
    type: String,
    required: false,
    trim: true,
    unique: true,
    sparse: true
  },
  tokenVersion: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    timestamp: Date,
    ipAddress: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
