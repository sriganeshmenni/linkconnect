const mongoose = require('mongoose');

// Ensure the submissions collection uses the correct index (link + student)
const ensureSubmissionIndexes = async () => {
  try {
    const Submission = require('../models/Submission');
    const collection = mongoose.connection.collection('submissions');

    // Drop legacy index that used wrong field names (linkId_1_studentId_1)
    const indexes = await collection.indexes();
    const legacy = indexes.find((idx) => idx.name === 'linkId_1_studentId_1');
    if (legacy) {
      await collection.dropIndex('linkId_1_studentId_1');
      console.log('🧹 Dropped legacy submissions index linkId_1_studentId_1');
    }

    // Sync indexes defined on the model (creates link_1_student_1 if missing)
    await Submission.syncIndexes();
  } catch (err) {
    console.warn('Warning: could not verify submission indexes:', err.message);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');

    // After connecting, ensure indexes are correct
    await ensureSubmissionIndexes();
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
