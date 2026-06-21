const mongoose = require('mongoose');

const TrustApplicationSchema = new mongoose.Schema({
  // ========== USER LINK ==========
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // ========== TRUST TYPE & JURISDICTION ==========
  trustType: { 
    type: String, 
    required: true, 
    enum: ['revocable', 'irrevocable', 'asset_protection', 'digital_asset', 'charitable'] 
  },
  
  jurisdiction: { 
    type: String, 
    required: true,
    enum: ['WY', 'SD', 'DE', 'NV', 'CK']
  },

  // ========== TRUST NAME ==========
  trustName: { 
    type: String, 
    required: true 
  },
  
  alternativeTrustName1: { 
    type: String, 
    required: true 
  },
  
  alternativeTrustName2: { 
    type: String, 
    required: true 
  },

  // ========== SETTLOR (GRANTOR) INFORMATION ==========
  settlor: {
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    nationality: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true }
    },
    email: { type: String, required: true },
    phone: { type: String }
  },

  // ========== BENEFICIARIES ==========
  beneficiaries: [{
    name: { type: String, required: true },
    relationship: { 
      type: String, 
      required: true,
      enum: ['spouse', 'child', 'parent', 'sibling', 'other_relative', 'friend', 'entity']
    },
    allocation: { 
      type: Number, 
      required: true,
      min: 1, 
      max: 100 
    },
    email: { type: String },
    walletAddress: { type: String }  // For crypto distribution
  }],

  // ========== TRUSTEE INFORMATION ==========
  trustee: {
    type: { 
      type: String, 
      required: true,
      enum: ['montreval', 'individual', 'co_trustee']
    },
    fullName: { type: String },        // Only if individual/co-trustee
    email: { type: String },
    phone: { type: String }
  },
  
  successorTrustee: { 
    type: String 
  },

  // ========== TRUST PURPOSE & ASSETS ==========
  trustPurpose: { 
    type: String, 
    required: true,
    enum: [
      'wealth_preservation', 
      'crypto_holding', 
      'estate_planning', 
      'defi_management', 
      'nft_custody', 
      'family_legacy', 
      'charitable', 
      'other'
    ]
  },
  
  trustPurposeOther: { 
    type: String 
  },

  estimatedValue: { 
    type: String, 
    required: true,
    enum: ['50k-100k', '100k-500k', '500k-1m', '1m-5m', '5m+']
  },

  assetTypes: [{ 
    type: String,
    enum: ['bitcoin', 'ethereum', 'stablecoins', 'nfts', 'defi', 'real_estate', 'stocks', 'cash']
  }],

  // ========== SOURCE OF FUNDS ==========
  sourceOfFunds: { 
    type: String, 
    required: true,
    enum: ['crypto_trading', 'crypto_mining', 'employment', 'business', 'inheritance', 'investment', 'other']
  },

  // ========== DOCUMENTS ==========
  documents: [{
    fileName: { type: String },
    filePath: { type: String },
    documentType: { 
      type: String, 
      enum: ['id_document', 'address_proof', 'additional'] 
    },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // ========== STATUS & ADMIN ==========
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'under_review', 'approved', 'rejected', 'active', 'suspended', 'terminated'],
    default: 'draft' 
  },
  
  adminNotes: { 
    type: String 
  },
  
  rejectionReason: { 
    type: String 
  },

  // ========== TRUST EXECUTION DETAILS (set by admin) ==========
  trustExecutionDate: { 
    type: Date 
  },
  
  trustDocumentHash: { 
    type: String            // Blockchain hash of trust deed
  },
  
  trustWalletAddress: { 
    type: String            // Multi-sig wallet for trust assets
  },

  // ========== PAYMENT ==========
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded', 'waived'],
    default: 'pending' 
  },
  
  paymentAmount: { 
    type: Number,
    default: 2500           // $2,500 processing fee
  },
  
  paymentDate: { 
    type: Date 
  },
  
  transactionId: { 
    type: String 
  },

  // ========== TIMESTAMPS ==========
  submittedAt: { 
    type: Date 
  },
  
  reviewedAt: { 
    type: Date 
  },
  
  approvedAt: { 
    type: Date 
  },
  
  rejectedAt: { 
    type: Date 
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

// ========== PRE-SAVE HOOK ==========
TrustApplicationSchema.pre('save', async function() {
  this.updatedAt = new Date();
  
  // Auto-set submittedAt when moving from draft to pending
  if (this.status === 'pending' && !this.submittedAt) {
    this.submittedAt = new Date();
  }
  
  // Auto-set reviewedAt when admin starts review
  if (this.status === 'under_review' && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  
  // Auto-set approvedAt
  if (this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = new Date();
    this.trustExecutionDate = new Date();
  }
  
  // Auto-set rejectedAt
  if (this.status === 'rejected' && !this.rejectedAt) {
    this.rejectedAt = new Date();
  }
});

// ========== INDEXES FOR FASTER QUERIES ==========
TrustApplicationSchema.index({ userId: 1, status: 1 });
TrustApplicationSchema.index({ status: 1, submittedAt: -1 });
TrustApplicationSchema.index({ trustType: 1 });

// ========== VIRTUAL: Full trust name with type ==========
TrustApplicationSchema.virtual('fullTrustName').get(function() {
  const typeMap = {
    'revocable': 'Revocable Living Trust',
    'irrevocable': 'Irrevocable Trust',
    'asset_protection': 'Asset Protection Trust',
    'digital_asset': 'Digital Asset Trust',
    'charitable': 'Charitable Remainder Trust'
  };
  return `${this.trustName} (${typeMap[this.trustType] || this.trustType})`;
});

// ========== VIRTUAL: Total beneficiary allocation ==========
TrustApplicationSchema.virtual('totalAllocation').get(function() {
  return this.beneficiaries.reduce((sum, b) => sum + (b.allocation || 0), 0);
});

// ========== METHOD: Check if ready for submission ==========
TrustApplicationSchema.methods.isReadyForSubmission = function() {
  return !!(
    this.trustType &&
    this.trustName &&
    this.jurisdiction &&
    this.settlor?.fullName &&
    this.beneficiaries?.length > 0 &&
    this.trustPurpose &&
    this.documents?.length >= 2
  );
};

// ========== METHOD: Get status badge ==========
TrustApplicationSchema.methods.getStatusBadge = function() {
  const badges = {
    'draft': '📝 Draft',
    'pending': '⏳ Pending Review',
    'under_review': '🔍 Under Review',
    'approved': '✅ Approved',
    'rejected': '❌ Rejected',
    'active': '🟢 Active Trust',
    'suspended': '🟡 Suspended',
    'terminated': '🔴 Terminated'
  };
  return badges[this.status] || this.status;
};

module.exports = mongoose.model('TrustApplication', TrustApplicationSchema);
