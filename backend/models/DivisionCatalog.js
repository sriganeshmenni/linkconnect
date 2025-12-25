const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    name: { type: String, default: '' },
    years: { type: [Number], default: [1, 2, 3, 4] },
    sections: { type: [String], default: ['A'] },
  },
  { _id: false }
);

const collegeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    name: { type: String, default: '' },
    branches: { type: [branchSchema], default: [] },
  },
  { _id: false }
);

const divisionCatalogSchema = new mongoose.Schema({
  colleges: { type: [collegeSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DivisionCatalog', divisionCatalogSchema);
