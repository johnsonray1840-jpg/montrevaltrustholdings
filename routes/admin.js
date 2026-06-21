const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const WithdrawalRequest = require('../models/WithdrawalRequest');

// Apply middleware to all admin routes
router.use(isAuthenticated);
router.use(isAdmin);

// ============================================
// DASHBOARD ROUTES
// ============================================
router.get('/dashboard', adminController.getDashboard);

// ============================================
// PLAN MANAGEMENT ROUTES
// ============================================
router.get('/plans', adminController.getPlans);
router.get('/plans/create', adminController.getCreatePlan);
router.post('/plans/create', adminController.createPlan);
router.get('/plans/edit/:id', adminController.getEditPlan);
router.post('/plans/edit/:id', adminController.updatePlan);
router.post('/plans/delete/:id', adminController.deletePlan);
router.post('/plans/toggle/:id', adminController.togglePlanStatus);

// ============================================
// TRUST APPLICATION ROUTES (NEW)
// ============================================
router.get('/trusts', adminController.getTrustApplications);
router.get('/trusts/:id', adminController.getTrustDetail);
router.get('/trusts/document/:id/:index', adminController.viewTrustDocument);
router.post('/trusts/:id/approve', adminController.approveTrust);
router.post('/trusts/:id/reject', adminController.rejectTrust);
router.post('/trusts/:id/activate', adminController.activateTrust);
router.post('/trusts/:id/delete', adminController.deleteTrust);

// ============================================
// WALLET POOL ROUTES
// ============================================
router.get('/wallet-pool', adminController.getWalletPool);
router.post('/wallet-pool/add', adminController.addWalletPhrase);
router.post('/wallet-pool/bulk-add', adminController.bulkAddWalletPhrases);
router.post('/wallet-pool/delete/:id', adminController.deleteWalletPhrase);
router.post('/wallet/adjust/:id', adminController.adjustWalletBalance);

// ============================================
// WITHDRAWAL MANAGEMENT ROUTES
// ============================================
router.get('/withdrawals', adminController.getWithdrawals);
router.post('/withdrawals/:id/approve', adminController.approveWithdrawal);
router.post('/withdrawals/:id/reject', adminController.rejectWithdrawal);

// ============================================
// USER MANAGEMENT ROUTES
// ============================================
router.get('/users', adminController.getUsers);

// ============================================
// KYC MANAGEMENT ROUTES
// ============================================
router.get('/kyc', adminController.getKycList);
router.get('/kyc/:id', adminController.getKycDetail);
router.get('/kyc/document/:id/:type', adminController.viewKycDocument);
router.post('/kyc/:id/approve', adminController.approveKyc);
router.post('/kyc/:id/reject', adminController.rejectKyc);
router.post('/kyc/:id/delete', adminController.deleteKyc);

module.exports = router;