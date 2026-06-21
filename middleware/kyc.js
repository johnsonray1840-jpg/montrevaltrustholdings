const requireKycApproved = (req, res, next) => {
  if (!req.session.user) return res.redirect('/auth/login');
  if (!req.session.user.kycStatus || req.session.user.kycStatus !== 'approved') {
    return res.redirect('/user/kyc?error=You+must+complete+identity+verification+before+proceeding.');
  }
  next();
};
module.exports = { requireKycApproved };

