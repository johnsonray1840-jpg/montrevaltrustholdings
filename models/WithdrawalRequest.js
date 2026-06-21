const mongoose = require('mongoose');

const WithdrawalRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletPool', required: true },
  chain: { type: String, required: true, enum: ['btc', 'eth', 'usdt', 'xrp', 'bnb'] },
  amount: { type: Number, required: true, min: 0.01 },
  toAddress: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// CORRECT ASYNC PRE‑SAVE HOOK – NO next PARAMETER
WithdrawalRequestSchema.pre('save', async function() {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);