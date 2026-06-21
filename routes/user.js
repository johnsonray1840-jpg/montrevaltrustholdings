const express = require('express');
const router = express.Router();
const { isAuthenticated, requireVerified } = require('../middleware/auth');
const userController = require('../controllers/userController');
const upload = require('../config/multer');
const { requireKycApproved } = require('../middleware/kyc');

// Apply authentication middleware to all user routes
router.use(isAuthenticated);

// Dashboard
router.get('/dashboard', userController.getDashboard);

// Trusts (renamed from LLCs)
router.get('/trusts', userController.getTrusts);
router.get('/trusts/:id', userController.getTrustDetail);

// Wallet
router.get('/wallet', requireVerified, userController.getWallet);
router.get('/wallet/create', requireVerified, requireKycApproved, userController.getCreateWallet);
router.post('/wallet/confirm', requireVerified, requireKycApproved, userController.postConfirmWallet);
router.get('/wallet/set-pin', requireVerified, userController.getSetPin);
router.post('/wallet/set-pin', requireVerified, userController.postSetPin);
router.post('/wallet/unlock', requireVerified, userController.postUnlockWallet);
router.post('/wallet/withdraw', requireVerified, userController.submitWithdrawal);

// Settings
router.get('/settings', userController.getSettings);
router.post('/settings', userController.postSettings);
router.post('/settings/password', userController.postChangePassword);

// KYC
const kycUpload = upload.fields([
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'addressDoc', maxCount: 1 }
]);
router.get('/kyc', userController.getKyc);
router.post('/kyc/submit', requireVerified, kycUpload, userController.submitKyc);

module.exports = router;