const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  fullName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  emailVerified: { type: Boolean, default: false },
  emailVerificationCode: String,
  emailVerificationExpires: Date,
  kycStatus: {
    type: String,
    enum: ['not_started', 'pending', 'approved', 'rejected'],
    default: 'not_started'
  },
  kycData: {
    dateOfBirth: Date,
    ssnLast4: String,
    phoneVerified: { type: Boolean, default: false },
    idType: { type: String, enum: ['passport', 'drivers_license', 'national_id'] },
    idNumber: String,
    idFrontImage: { fileName: String, filePath: String, uploadedAt: Date },
    idBackImage: { fileName: String, filePath: String, uploadedAt: Date },
    selfieImage: { fileName: String, filePath: String, uploadedAt: Date },
    addressDocument: { fileName: String, filePath: String, uploadedAt: Date },
    addressDetails: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'USA' }
    }
  },
  kycSubmittedAt: Date,
  kycReviewedAt: Date,
  kycReviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  kycRejectionReason: String,
  kycAdminNotes: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  createdAt: { type: Date, default: Date.now },
  passwordResetToken: String,
  passwordResetExpires: Date
});

// Password strength validation (optional but can be used in pre-save)
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
