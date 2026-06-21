const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'Montreval Trust Holdings <noreply@montrevaltrustholdings.org>';
const BASE_URL = process.env.BASE_URL || 'http://localhost:9000';

// ---------- Shared Premium Email Wrapper ----------
const wrapEmail = ({ title, preheader, content, actionUrl, actionText, ctaColor }) => {
  const colorPrimary = '#223140';
  const colorWhite = '#ffffff';
  const colorSuccess = '#22c55e';
  const colorDanger = '#ef4444';
  const colorWarning = '#f59e0b';
  const bgDark = '#0f172a';
  const bgCard = '#1a1f2e';
  const bgSection = 'rgba(255, 255, 255, 0.03)';
  const textLight = '#e2e8f0';
  const textMuted = '#94a3b8';
  const borderColor = 'rgba(255, 255, 255, 0.08)';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:${bgDark}; font-family:'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Preheader -->
  <div style="display:none; max-height:0; overflow:hidden;">${preheader}</div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${bgDark}; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:${bgCard}; border-radius:16px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.5); border:1px solid ${borderColor};">
          
          <!-- Logo Header -->
          <tr>
            <td style="background-color:${colorPrimary}; padding:30px 40px; text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:26px; font-weight:700; color:${colorWhite}; letter-spacing:-0.5px;">
                    MONTREVAL
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px; color:rgba(255,255,255,0.7); padding-top:4px; letter-spacing:2px; text-transform:uppercase;">
                    Trust Holdings
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:16px;">
                    <div style="height:1px; background:rgba(255,255,255,0.2); width:60px; margin:0 auto;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="font-size:17px; color:rgba(255,255,255,0.9); padding-top:12px; font-weight:500;">${title}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px; color:${textLight}; font-size:16px; line-height:1.7;">
              ${content}

              ${actionUrl ? `
              <div style="text-align:center; margin:30px 0;">
                <a href="${actionUrl}" style="display:inline-block; background-color:${ctaColor || colorPrimary}; color:${colorWhite}; text-decoration:none; padding:14px 32px; border-radius:8px; font-weight:600; font-size:15px; border:1px solid rgba(255,255,255,0.15);">${actionText || 'Go to Dashboard'}</a>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px; background:${borderColor};"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px; text-align:center; font-size:12px; color:${textMuted};">
              <p style="margin:0 0 6px;">&copy; ${new Date().getFullYear()} Montreval Trust Holdings. All Rights Reserved.</p>
              <p style="margin:0;">Secure Wealth Management &amp; Trust Solutions</p>
              <p style="margin:8px 0 0; font-size:11px;">This email was sent to you because you have an account with Montreval Trust Holdings.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// ---------- Email Templates (Montreval Trust Holdings) ----------
const emailTemplates = {
  
  // ==================== AUTH ====================
  
  welcome: (name) => ({
    subject: 'Welcome to Montreval Trust Holdings',
    html: wrapEmail({
      title: 'Account Verified',
      preheader: 'Your trust journey begins now.',
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your email has been verified successfully. You now have full access to your Montreval Trust Holdings account.</p>
        <p>Here's what you can do next:</p>
        <ul style="padding-left:20px;">
          <li style="margin-bottom:8px;">Complete your <strong>KYC verification</strong> to unlock trust formation and asset management.</li>
          <li style="margin-bottom:8px;">Start a <strong>Trust Application</strong> to secure your digital assets.</li>
          <li style="margin-bottom:8px;">Explore our <strong>Trust Structures</strong> — Revocable, Irrevocable, Asset Protection, and more.</li>
        </ul>
      `,
      actionUrl: `${BASE_URL}/user/dashboard`,
      actionText: 'Go to Dashboard'
    })
  }),

  verificationCode: (name, code) => ({
    subject: 'Verify Your Email - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'Email Verification',
      preheader: 'Your verification code is inside.',
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Please use the following code to verify your email address:</p>
        <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:24px; text-align:center; margin:25px 0;">
          <span style="font-size:36px; font-weight:700; letter-spacing:8px; color:#ffffff;">${code}</span>
        </div>
        <p style="color:#94a3b8; font-size:14px;">This code expires in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
      `
    })
  }),

  //=====================password reset====================
  passwordReset: (name, resetUrl) => ({
    subject: 'Password Reset - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'Password Reset',
      preheader: 'Reset your account password.',
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <p style="color:#94a3b8; font-size:14px;">This link expires in <strong>1 hour</strong>. If you did not request this, please ignore this email.</p>
      `,
      actionUrl: resetUrl,
      actionText: 'Reset Password'
    })
  }),

  passwordChanged: (name) => ({
    subject: 'Password Changed - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'Password Updated',
      preheader: 'Your password has been changed successfully.',
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your password has been <span style="color:#22c55e; font-weight:600;">changed successfully</span>.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
      `,
      actionUrl: `${BASE_URL}/auth/login`,
      actionText: 'Sign In'
    })
  }),

  // ==================== TRUST APPLICATIONS ====================
  
  trustSubmitted: (name, trustName) => ({
    subject: 'Trust Application Received - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'Application Received',
      preheader: `We've received your trust application for "${trustName}".`,
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>We have received your trust application for:</p>
        <div style="background:${'rgba(255,255,255,0.03)'}; border:1px solid ${'rgba(255,255,255,0.08)'}; border-radius:10px; padding:20px; margin:20px 0; text-align:center;">
          <p style="font-size:18px; font-weight:600; margin:0; color:#ffffff;">${trustName}</p>
        </div>
        <p>Your application is now <span style="color:#f59e0b; font-weight:600;">pending review</span> by our trust specialists.</p>
        <p>You will receive another email once your trust has been reviewed. Typical processing time is 3-5 business days.</p>
      `,
      actionUrl: `${BASE_URL}/user/dashboard`,
      actionText: 'View Application Status'
    })
  }),

  trustApproved: (name, trustName, trustType) => ({
    subject: 'Trust Application Approved - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'Trust Approved',
      preheader: `Congratulations! Your trust "${trustName}" has been approved.`,
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Congratulations! Your trust application for <strong>${trustName}</strong> has been <span style="color:#22c55e; font-weight:600;">approved</span>.</p>
        <div style="background:rgba(34,197,94,0.05); border:1px solid rgba(34,197,94,0.2); border-radius:10px; padding:16px; margin:20px 0;">
          <p style="margin:0; font-size:14px;"><strong>Trust Type:</strong> ${trustType}</p>
          <p style="margin:4px 0 0; font-size:14px;"><strong>Trust Name:</strong> ${trustName}</p>
        </div>
        <p>You now have access to:</p>
        <ul style="padding-left:20px;">
          <li style="margin-bottom:8px;">Official trust formation documents</li>
          <li style="margin-bottom:8px;">Digital asset custody setup</li>
          <li style="margin-bottom:8px;">Beneficiary management portal</li>
          <li style="margin-bottom:8px;">Multi-signature wallet integration</li>
        </ul>
      `,
      actionUrl: `${BASE_URL}/user/dashboard`,
      actionText: 'Access Your Trust Dashboard',
      ctaColor: '#22c55e'
    })
  }),

  trustRejected: (name, trustName, reason) => ({
    subject: 'Trust Application Update - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'Application Needs Attention',
      preheader: `Your trust "${trustName}" requires additional attention.`,
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your trust application for <strong>${trustName}</strong> requires additional attention.</p>
        <div style="background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.2); border-radius:10px; padding:16px; margin:20px 0;">
          <p style="margin:0; font-size:14px; color:#ef4444;"><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>Please log in to your dashboard to review and resubmit your application. Our support team is available to assist you.</p>
      `,
      actionUrl: `${BASE_URL}/user/dashboard`,
      actionText: 'Review Application',
      ctaColor: '#ef4444'
    })
  }),

  trustActivated: (name, trustName) => ({
    subject: 'Trust Now Active - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'Trust Activated',
      preheader: `Your trust "${trustName}" is now active.`,
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your trust <strong>${trustName}</strong> is now <span style="color:#22c55e; font-weight:600;">active</span>.</p>
        <p>All trust provisions are now in effect. You can manage your trust, update beneficiaries, and monitor assets through your dashboard.</p>
      `,
      actionUrl: `${BASE_URL}/user/dashboard`,
      actionText: 'Manage Your Trust',
      ctaColor: '#22c55e'
    })
  }),

  // ==================== WALLET & BALANCE ====================
  
  walletCreated: (name, walletAddress) => ({
    subject: 'Crypto Wallet Created - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'Wallet Created',
      preheader: 'Your secure crypto wallet is now active.',
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your crypto wallet has been created and linked to your trust.</p>
        <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:20px; margin:25px 0;">
          <p style="margin:0 0 8px; font-size:13px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Wallet Address</p>
          <p style="font-family:monospace; font-size:15px; margin:0; word-break:break-all; color:#ffffff;">${walletAddress}</p>
        </div>
        <p style="color:#f59e0b; font-weight:600; font-size:14px;">&#x26A0;&#xFE0F; IMPORTANT: Your recovery phrase was displayed only once during creation. If you did not save it securely, you may lose access to your wallet.</p>
      `,
      actionUrl: `${BASE_URL}/user/wallet`,
      actionText: 'View Wallet'
    })
  }),

  balanceAdded: (name, amount, reason, newBalance) => ({
    subject: 'Balance Updated - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'Balance Updated',
      preheader: `${amount} USD has been added to your wallet.`,
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p><strong>$${amount.toLocaleString()}</strong> has been added to your wallet balance.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Your new total balance is <strong>$${newBalance.toLocaleString()}</strong>.</p>
      `,
      actionUrl: `${BASE_URL}/user/wallet`,
      actionText: 'View Wallet'
    })
  }),

  // ==================== WITHDRAWALS ====================
  
  withdrawalSubmitted: (name, amount, chain, toAddress) => ({
    subject: 'Withdrawal Request Submitted - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'Withdrawal Request Received',
      preheader: `Your withdrawal request for $${amount} on ${chain.toUpperCase()} has been submitted.`,
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your withdrawal request has been received:</p>
        <ul style="padding-left:20px;">
          <li style="margin-bottom:6px;"><strong>Amount:</strong> $${amount.toLocaleString()}</li>
          <li style="margin-bottom:6px;"><strong>Network:</strong> ${chain.toUpperCase()}</li>
          <li style="margin-bottom:6px;"><strong>Destination:</strong> <span style="font-family:monospace; font-size:13px;">${toAddress}</span></li>
        </ul>
        <p>Your request is pending review. You will be notified once it is processed.</p>
      `,
      actionUrl: `${BASE_URL}/user/wallet`,
      actionText: 'View Wallet'
    })
  }),
  
  withdrawalApproved: (name, amount, chain) => ({
    subject: 'Withdrawal Approved - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'Withdrawal Approved',
      preheader: `Your withdrawal of $${amount} on ${chain.toUpperCase()} has been approved.`,
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your withdrawal request for <strong>$${amount.toLocaleString()}</strong> on <strong>${chain.toUpperCase()}</strong> has been <span style="color:#22c55e; font-weight:600;">approved</span>.</p>
        <p>The funds will be sent to your destination address shortly.</p>
      `,
      actionUrl: `${BASE_URL}/user/wallet`,
      actionText: 'View Wallet',
      ctaColor: '#22c55e'
    })
  }),
  
  withdrawalRejected: (name, amount, chain, reason) => ({
    subject: 'Withdrawal Rejected - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'Withdrawal Rejected',
      preheader: `Your withdrawal of $${amount} on ${chain.toUpperCase()} was not approved.`,
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your withdrawal request for <strong>$${amount.toLocaleString()}</strong> on <strong>${chain.toUpperCase()}</strong> has been <span style="color:#ef4444; font-weight:600;">rejected</span>.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please contact our support team if you have questions.</p>
      `,
      actionUrl: `${BASE_URL}/user/wallet`,
      actionText: 'View Wallet',
      ctaColor: '#ef4444'
    })
  }),

  // ==================== KYC ====================
  
  kycApproved: (name) => ({
    subject: 'KYC Verification Approved - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'KYC Approved',
      preheader: 'Your identity has been verified.',
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your KYC documents have been <span style="color:#22c55e; font-weight:600;">approved</span>.</p>
        <p>You now have full access to all platform features, including trust formation, asset management, and wallet creation.</p>
      `,
      actionUrl: `${BASE_URL}/user/dashboard`,
      actionText: 'Go to Dashboard',
      ctaColor: '#22c55e'
    })
  }),

  kycRejected: (name, reason) => ({
    subject: 'KYC Verification Update - Montreval Trust Holdings',
    html: wrapEmail({
      title: 'KYC Needs Attention',
      preheader: 'Your KYC submission was not approved.',
      content: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your KYC submission was not approved.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please log in to resubmit your documents. Ensure all images are clear and valid.</p>
      `,
      actionUrl: `${BASE_URL}/user/kyc`,
      actionText: 'Resubmit Documents',
      ctaColor: '#ef4444'
    })
  })
};

// ==================== SEND EMAIL FUNCTION ====================
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
      text: text || ''
    });

    if (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error };
    }

    console.log('✅ Email sent:', data.id);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email service error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, emailTemplates };