const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    unique: true   // still unique, but no hardcoded list
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  processingTime: {
    type: String,
    required: [true, 'Processing time is required']
  },
  features: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  recommended: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// CORRECT ASYNC PRE‑SAVE HOOK – NO next PARAMETER
PlanSchema.pre('save', async function() {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Plan', PlanSchema);