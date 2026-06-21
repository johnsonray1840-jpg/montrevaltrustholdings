const mongoose = require('mongoose');

const WalletPoolSchema = new mongoose.Schema({
  recoveryPhrase: {
    type: String,
    required: [true, 'Recovery phrase is required'],
    unique: true   // must be unique in the pool
  },
  addresses: {
    btc: { type: String, required: true },
    eth: { type: String, required: true },
    usdt: { type: String, required: true },
    xrp: { type: String, required: true },
    bnb: { type: String, required: true }
  },
  // No walletType – the chain is implied by the address
  status: {
    type: String,
    enum: ['available', 'assigned', 'viewed', 'archived'],
    default: 'available'
  },
  manualBalance: { type: Number, default: 0 },   // admin‑controlled override
balanceAdjustments: [{
  amount: Number,
  operation: { type: String, enum: ['add', 'subtract'] },
  reason: String,
  date: { type: Date, default: Date.now },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedTrustId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TrustApplication',
    default: null
  },
  assignedAt: Date,
  hasBeenViewed: {
    type: Boolean,
    default: false
  },
  viewedAt: Date,
  viewToken: String,
  viewTokenExpires: Date,
  // PIN security
  pinHash: { type: String, default: null },
  
  // Wallet content tracking
  lastBalanceCheck: Date,
  currentBalanceUSD: { type: Number, default: 0 },
  assets: [{
    symbol: String,
    name: String,
    chain: String,         // e.g. 'btc','eth','usdt','xrp','bnb'
    balance: Number,
    usdValue: Number
  }],
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

WalletPoolSchema.pre('save', async function() {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('WalletPool', WalletPoolSchema);
