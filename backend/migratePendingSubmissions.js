// Script to update all 'pending' student submissions to 'completed'
// Usage: node migratePendingSubmissions.js

const mongoose = require('mongoose');
const Submission = require('./models/Submission');
const config = require('./config/database');

async function migrate() {
  await mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  const result = await Submission.updateMany({ status: 'pending' }, { $set: { status: 'completed' } });
  console.log(`Updated ${result.nModified || result.modifiedCount} submissions from 'pending' to 'completed'.`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
