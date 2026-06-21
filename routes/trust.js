const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const TrustApplication = require('../models/TrustApplication');
const User = require('../models/User');
const { isAuthenticated, requireVerified } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// ==================== SUBMIT TRUST APPLICATION ====================
router.post('/submit',
  isAuthenticated,
  requireVerified,
  upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const userId = req.session.user.id;
      const formData = { ...req.session.trustDraft, ...req.body };
      delete req.session.trustDraft;

      // Build documents array
      const documents = [];
      if (req.files?.idDocument) {
        documents.push({
          fileName: req.files.idDocument[0].originalname,
          filePath: req.files.idDocument[0].path,
          documentType: 'id_document'
        });
      }
      if (req.files?.addressProof) {
        documents.push({
          fileName: req.files.addressProof[0].originalname,
          filePath: req.files.addressProof[0].path,
          documentType: 'address_proof'
        });
      }

      // Parse beneficiaries (comes as arrays from form)
      const beneficiaries = [];
      if (formData.beneficiary) {
        const b = formData.beneficiary;
        for (let i = 0; i < b.length; i++) {
          if (b[i]?.name) {
            beneficiaries.push({
              name: b[i].name,
              relationship: b[i].relationship,
              allocation: parseInt(b[i].allocation) || 0,
              email: b[i].email || undefined,
              walletAddress: b[i].walletAddress || undefined
            });
          }
        }
      }

      // Build trust application data
      const trustData = {
        userId,
        trustType: formData.trustType,
        jurisdiction: formData.jurisdiction,
        trustName: formData.trustName,
        alternativeTrustName1: formData.alternativeTrustName1,
        alternativeTrustName2: formData.alternativeTrustName2,
        settlor: {
          fullName: formData.settlorName,
          dateOfBirth: formData.settlorDOB,
          nationality: formData.settlorNationality,
          address: {
            street: formData.settlorAddress,
            city: formData.settlorCity,
            country: formData.settlorCountry
          },
          email: formData.settlorEmail,
          phone: formData.settlorPhone || undefined
        },
        beneficiaries,
        trustee: {
          type: formData.trusteeType,
          fullName: formData.trusteeName || undefined,
          email: formData.trusteeEmail || undefined,
          phone: formData.trusteePhone || undefined
        },
        successorTrustee: formData.successorTrustee || undefined,
        trustPurpose: formData.trustPurpose,
        trustPurposeOther: formData.trustPurposeOther || undefined,
        estimatedValue: formData.estimatedValue,
        assetTypes: Array.isArray(formData.assetTypes) ? formData.assetTypes : [formData.assetTypes].filter(Boolean),
        sourceOfFunds: formData.sourceOfFunds,
        documents,
        status: 'pending',
        submittedAt: new Date()
      };

      const application = await TrustApplication.create(trustData);

      // Send confirmation email
      try {
        const user = await User.findById(userId);
        const emailData = emailTemplates.trustSubmitted(user.fullName, application.trustName);
        await sendEmail({ to: user.email, subject: emailData.subject, html: emailData.html });
      } catch (emailError) {
        console.error('Trust submission email failed:', emailError);
      }

      res.redirect('/user/dashboard?success=Trust+application+submitted+successfully');
    } catch (error) {
      console.error('Trust submission error:', error);
      res.status(500).render('500', { title: 'Server Error', error: error.message });
    }
  }
);

// ==================== SAVE DRAFT (AJAX) ====================
router.post('/save-draft', isAuthenticated, (req, res) => {
  req.session.trustDraft = req.body;
  res.json({ success: true });
});

// ==================== USER'S TRUST APPLICATIONS ====================
router.get('/my-trusts', isAuthenticated, async (req, res) => {
  try {
    const applications = await TrustApplication.find({ userId: req.session.user.id })
      .sort({ createdAt: -1 });
    
    res.render('user/trusts', {
      title: 'My Trust Applications',
      applications,
      user: req.session.user
    });
  } catch (error) {
    console.error('Get trusts error:', error);
    res.redirect('/user/dashboard?error=Failed to load trusts');
  }
});

// ==================== SINGLE TRUST DETAIL ====================
router.get('/my-trusts/:id', isAuthenticated, async (req, res) => {
  try {
    const application = await TrustApplication.findOne({
      _id: req.params.id,
      userId: req.session.user.id
    });

    if (!application) {
      return res.redirect('/user/dashboard?error=Trust not found');
    }

    res.render('user/trusts-detail', {
      title: 'Trust Details',
      application,
      user: req.session.user
    });
  } catch (error) {
    console.error('Get trust detail error:', error);
    res.redirect('/user/dashboard?error=Failed to load trust');
  }
});

module.exports = router;