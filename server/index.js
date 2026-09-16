const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { query, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// FIX FINDING #3: Cryptographic Secret Configuration
if (!process.env.JWT_SECRET) {
  console.warn('SECURITY WARNING: JWT_SECRET environment variable is not defined. Using a generated runtime secret key.');
}
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// FIX FINDING #9: In-memory token blacklist for logout invalidation
// Stores { token, expiresAt } — auto-pruned on each logout to prevent memory growth
const tokenBlacklist = new Set();
function blacklistToken(token) {
  try {
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp ? decoded.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
    tokenBlacklist.add(token);
    // Prune expired tokens from blacklist to prevent unbounded memory growth
    const now = Date.now();
    for (const t of tokenBlacklist) {
      try {
        const d = jwt.decode(t);
        if (d?.exp && d.exp * 1000 < now) tokenBlacklist.delete(t);
      } catch { tokenBlacklist.delete(t); }
    }
  } catch { /* ignore */ }
}
function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

// FIX FINDING #6: Security Headers (Helmet) & Restricted CORS Origin
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://192.168.1.2:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // FIX FINDING #8: Enforce CORS whitelist — reject all non-allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: Origin '${origin}' is not allowed.`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// FIX FINDING #4: Rate Limiting on Authentication Endpoints (disabled/relaxed in test mode)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true' ? 10000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

app.use('/api/auth/', authLimiter);

// Initialize Database schema on startup
initDatabase();

// JWT Helper
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// FIX FINDING #1: Strict Authentication Middleware (NO FALLBACK TO DEFAULT USER)
// FIX FINDING #9: Also checks token blacklist (invalidated on logout)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ error: 'Session has been invalidated. Please log in again.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
    }
    req.user = decoded;
    next();
  });
}

// Helper to format User object
function formatUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatar_url || null,
    provider: u.provider || 'email',
    phone: u.phone || null,
    location: u.location || null,
    portfolioUrl: u.portfolio_url || null,
    githubUrl: u.github_url || null,
    linkedinUrl: u.linkedin_url || null,
    preferences: typeof u.preferences === 'string' ? JSON.parse(u.preferences) : u.preferences || {
      defaultStatus: 'Applied',
      defaultSource: 'JobStreet',
      currency: 'IDR',
      dateFormat: 'DD MMM YYYY',
      theme: 'light',
    },
    createdAt: u.created_at,
  };
}

// FIX FINDING #12: Health Check — minimal response, no technology fingerprinting
app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error' });
  }
});

// =========================================================
// AUTHENTICATION ENDPOINTS
// =========================================================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full Name is required' });
    }
    if (!email || !email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    // FIX FINDING #10: Minimum password length 8 chars (OWASP recommendation)
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check existing email
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1', [trimmedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}`;

    const newUser = await query(
      `INSERT INTO users (id, name, email, password_hash, provider, preferences)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        userId,
        name.trim(),
        trimmedEmail,
        passwordHash,
        'email',
        JSON.stringify({
          defaultStatus: 'Applied',
          defaultSource: 'JobStreet',
          currency: 'IDR',
          dateFormat: 'DD MMM YYYY',
          theme: 'light',
        }),
      ]
    );

    const userObj = formatUser(newUser.rows[0]);
    const token = generateToken(userObj);

    res.status(201).json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const result = await query('SELECT * FROM users WHERE LOWER(email) = $1', [trimmedEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userObj = formatUser(user);
    const token = generateToken(userObj);

    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
});

// FIX FINDING #2: Strict Server-Side Google OAuth Token Verification (NO UNVERIFIED CLIENT PROFILE FALLBACK)
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google ID Token credential is required.' });
    }

    if (!GOOGLE_CLIENT_ID || !googleClient) {
      return res.status(400).json({ error: 'Google OAuth is not configured on server. Please set GOOGLE_CLIENT_ID.' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      return res.status(401).json({ error: 'Google authentication failed: Invalid Google ID token.' });
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    if (!email) {
      return res.status(400).json({ error: 'Google authentication failed: Email not provided by Google.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    let result = await query('SELECT * FROM users WHERE LOWER(email) = $1 OR provider_id = $2', [trimmedEmail, googleId]);

    let user;
    if (result.rows.length > 0) {
      user = result.rows[0];
      if (picture && user.avatar_url !== picture) {
        const updatedRes = await query(
          'UPDATE users SET avatar_url = $1, provider_id = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
          [picture, googleId, user.id]
        );
        user = updatedRes.rows[0];
      }
    } else {
      const userId = `user-${Date.now()}`;
      const newRes = await query(
        `INSERT INTO users (id, name, email, avatar_url, provider, provider_id, preferences)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          userId,
          name || 'Google User',
          trimmedEmail,
          picture || null,
          'google',
          googleId,
          JSON.stringify({
            defaultStatus: 'Applied',
            defaultSource: 'JobStreet',
            currency: 'IDR',
            dateFormat: 'DD MMM YYYY',
            theme: 'light',
          }),
        ]
      );
      user = newRes.rows[0];
    }

    const userObj = formatUser(user);
    const token = generateToken(userObj);

    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ error: 'Google Authentication failed. Please try again.' });
  }
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const result = await query('SELECT id FROM users WHERE LOWER(email) = $1', [trimmedEmail]);

    if (result.rows.length > 0) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await query(
        'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
        [resetToken, expires, result.rows[0].id]
      );
    }

    res.json({
      message: "If an account exists with this email, we'll send you a password reset link.",
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error processing password reset.' });
  }
});

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Reset token is required' });
    }
    // FIX FINDING #10: Consistent minimum password length of 8 chars
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const result = await query(
      'SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    const user = result.rows[0];
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW() WHERE id = $2',
      [passwordHash, user.id]
    );

    res.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error resetting password.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(formatUser(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching user profile.' });
  }
});

// POST /api/auth/logout
// FIX FINDING #9: Require auth + blacklist the token to prevent reuse after logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) blacklistToken(token);
  res.json({ message: 'Logged out successfully' });
});

// =========================================================
// PROTECTED USER PROFILE ENDPOINTS (STRICT AUTH)
// =========================================================

app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(formatUser(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
});

app.put('/api/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, location, portfolioUrl, githubUrl, linkedinUrl, preferences, currentPassword } = req.body;

    // FIX FINDING #11: Input length limits on profile fields
    if (name !== undefined && name.length > 100) {
      return res.status(400).json({ error: 'Name must be 100 characters or fewer' });
    }
    if (phone !== undefined && phone && phone.length > 30) {
      return res.status(400).json({ error: 'Phone number must be 30 characters or fewer' });
    }
    if (location !== undefined && location && location.length > 150) {
      return res.status(400).json({ error: 'Location must be 150 characters or fewer' });
    }
    if (portfolioUrl !== undefined && portfolioUrl && portfolioUrl.length > 500) {
      return res.status(400).json({ error: 'Portfolio URL must be 500 characters or fewer' });
    }
    if (githubUrl !== undefined && githubUrl && githubUrl.length > 500) {
      return res.status(400).json({ error: 'GitHub URL must be 500 characters or fewer' });
    }
    if (linkedinUrl !== undefined && linkedinUrl && linkedinUrl.length > 500) {
      return res.status(400).json({ error: 'LinkedIn URL must be 500 characters or fewer' });
    }

    const current = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cur = current.rows[0];

    // FIX FINDING #13: Require current password before allowing email change
    if (email !== undefined && email.trim().toLowerCase() !== cur.email) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change your email address' });
      }
      if (!cur.password_hash) {
        return res.status(400).json({ error: 'Email change is not available for accounts using social login' });
      }
      const passwordMatch = await bcrypt.compare(currentPassword, cur.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Incorrect current password' });
      }
      // Check new email not already taken
      const emailConflict = await query('SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2', [email.trim().toLowerCase(), userId]);
      if (emailConflict.rows.length > 0) {
        return res.status(400).json({ error: 'This email address is already in use by another account' });
      }
    }

    const newName = name !== undefined ? name : cur.name;
    const newEmail = email !== undefined ? email.trim().toLowerCase() : cur.email;
    const newPhone = phone !== undefined ? phone : cur.phone;
    const newLoc = location !== undefined ? location : cur.location;
    const newPort = portfolioUrl !== undefined ? portfolioUrl : cur.portfolio_url;
    const newGit = githubUrl !== undefined ? githubUrl : cur.github_url;
    const newLin = linkedinUrl !== undefined ? linkedinUrl : cur.linkedin_url;
    const newPref = preferences !== undefined ? JSON.stringify(preferences) : cur.preferences;

    const result = await query(
      `UPDATE users 
       SET name = $1, email = $2, phone = $3, location = $4, portfolio_url = $5, github_url = $6, linkedin_url = $7, preferences = $8, updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [newName, newEmail, newPhone, newLoc, newPort, newGit, newLin, newPref, userId]
    );

    res.json(formatUser(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

// =========================================================
// DATA ISOLATION ENDPOINTS (STRICT AUTH SCOPED BY req.user.id)
// =========================================================

// Companies
app.get('/api/companies', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM companies WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    const companies = result.rows.map(c => ({
      id: c.id,
      userId: c.user_id,
      name: c.name,
      website: c.website,
      location: c.location,
      industry: c.industry,
      notes: c.notes,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching companies.' });
  }
});

app.post('/api/companies', authenticateToken, async (req, res) => {
  try {
    const { name, website, location, industry, notes } = req.body;

    // FIX FINDING #11: Input length limits on company fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    if (name.length > 150) return res.status(400).json({ error: 'Company name must be 150 characters or fewer' });
    if (website && website.length > 500) return res.status(400).json({ error: 'Website URL must be 500 characters or fewer' });
    if (location && location.length > 100) return res.status(400).json({ error: 'Location must be 100 characters or fewer' });
    if (industry && industry.length > 100) return res.status(400).json({ error: 'Industry must be 100 characters or fewer' });
    if (notes && notes.length > 5000) return res.status(400).json({ error: 'Notes must be 5000 characters or fewer' });

    const id = `comp-${Date.now()}`;
    const result = await query(
      `INSERT INTO companies (id, user_id, name, website, location, industry, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, req.user.id, name, website || null, location || null, industry || null, notes || null]
    );
    const c = result.rows[0];
    res.status(201).json({
      id: c.id,
      userId: c.user_id,
      name: c.name,
      website: c.website,
      location: c.location,
      industry: c.industry,
      notes: c.notes,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error creating company.' });
  }
});

// Applications
app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    const apps = result.rows.map(a => ({
      id: a.id,
      userId: a.user_id,
      companyId: a.company_id,
      companyName: a.company_name,
      position: a.position,
      jobType: a.job_type,
      workArrangement: a.work_arrangement,
      location: a.location,
      source: a.source,
      jobUrl: a.job_url,
      jobReference: a.job_reference,
      applicationDate: a.application_date ? a.application_date.toISOString().split('T')[0] : '',
      status: a.status,
      salaryMin: a.salary_min ? parseFloat(a.salary_min) : undefined,
      salaryMax: a.salary_max ? parseFloat(a.salary_max) : undefined,
      currency: a.currency,
      recruiterName: a.recruiter_name,
      recruiterEmail: a.recruiter_email,
      recruiterPhone: a.recruiter_phone,
      notes: a.notes,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching applications.' });
  }
});

async function findOrCreateCompanyDB(companyName, userId) {
  const trimmed = companyName.trim();
  const existing = await query(
    'SELECT * FROM companies WHERE LOWER(name) = LOWER($1) AND user_id = $2',
    [trimmed, userId]
  );
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const newCompId = `comp-${Date.now()}`;
  const inserted = await query(
    `INSERT INTO companies (id, user_id, name) VALUES ($1, $2, $3) RETURNING *`,
    [newCompId, userId, trimmed]
  );
  return inserted.rows[0];
}

app.post('/api/applications', authenticateToken, async (req, res) => {
  try {
    const appData = req.body;
    const userId = req.user.id;

    // FIX FINDING #11: Input length limits on application fields
    if (appData.companyName && appData.companyName.length > 150) return res.status(400).json({ error: 'Company name must be 150 characters or fewer' });
    if (appData.position && appData.position.length > 150) return res.status(400).json({ error: 'Position must be 150 characters or fewer' });
    if (appData.notes && appData.notes.length > 5000) return res.status(400).json({ error: 'Notes must be 5000 characters or fewer' });
    if (appData.jobUrl && appData.jobUrl.length > 500) return res.status(400).json({ error: 'Job URL must be 500 characters or fewer' });
    if (appData.jobReference && appData.jobReference.length > 100) return res.status(400).json({ error: 'Job reference must be 100 characters or fewer' });
    if (appData.recruiterName && appData.recruiterName.length > 100) return res.status(400).json({ error: 'Recruiter name must be 100 characters or fewer' });
    if (appData.recruiterEmail && appData.recruiterEmail.length > 100) return res.status(400).json({ error: 'Recruiter email must be 100 characters or fewer' });
    if (appData.recruiterPhone && appData.recruiterPhone.length > 30) return res.status(400).json({ error: 'Recruiter phone must be 30 characters or fewer' });

    const company = await findOrCreateCompanyDB(appData.companyName || 'Unknown Company', userId);
    const today = appData.applicationDate || new Date().toISOString().split('T')[0];
    const appId = `app-${Date.now()}`;

    const newAppResult = await query(
      `INSERT INTO applications (
        id, user_id, company_id, company_name, position, job_type, work_arrangement,
        location, source, job_url, job_reference, application_date, status,
        salary_min, salary_max, currency, recruiter_name, recruiter_email, recruiter_phone, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *`,
      [
        appId,
        userId,
        company.id,
        company.name,
        appData.position || 'Untitled Position',
        appData.jobType || 'Full Time',
        appData.workArrangement || 'On-site',
        appData.location || 'Indonesia',
        appData.source || 'JobStreet',
        appData.jobUrl || null,
        appData.jobReference || null,
        today,
        appData.status || 'Applied',
        appData.salaryMin || null,
        appData.salaryMax || null,
        appData.currency || 'IDR',
        appData.recruiterName || null,
        appData.recruiterEmail || null,
        appData.recruiterPhone || null,
        appData.notes || null,
      ]
    );

    const evId = `ev-${Date.now()}`;
    await query(
      `INSERT INTO application_events (id, application_id, status, event_date, title, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [evId, appId, appData.status || 'Applied', today, 'Application Created', `Initial status: ${appData.status || 'Applied'}`]
    );

    const a = newAppResult.rows[0];
    res.status(201).json({
      id: a.id,
      userId: a.user_id,
      companyId: a.company_id,
      companyName: a.company_name,
      position: a.position,
      jobType: a.job_type,
      workArrangement: a.work_arrangement,
      location: a.location,
      source: a.source,
      jobUrl: a.job_url,
      jobReference: a.job_reference,
      applicationDate: a.application_date ? a.application_date.toISOString().split('T')[0] : today,
      status: a.status,
      salaryMin: a.salary_min ? parseFloat(a.salary_min) : undefined,
      salaryMax: a.salary_max ? parseFloat(a.salary_max) : undefined,
      currency: a.currency,
      recruiterName: a.recruiter_name,
      recruiterEmail: a.recruiter_email,
      recruiterPhone: a.recruiter_phone,
      notes: a.notes,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error creating application.' });
  }
});

app.post('/api/applications/quick-apply', authenticateToken, async (req, res) => {
  try {
    const { companyName, position, source, jobUrl, applicationDate, status } = req.body;
    const userId = req.user.id;

    // FIX FINDING #11: Input length limits on quick-apply fields
    if (companyName && companyName.length > 150) return res.status(400).json({ error: 'Company name must be 150 characters or fewer' });
    if (position && position.length > 150) return res.status(400).json({ error: 'Position must be 150 characters or fewer' });
    if (jobUrl && jobUrl.length > 500) return res.status(400).json({ error: 'Job URL must be 500 characters or fewer' });

    const company = await findOrCreateCompanyDB(companyName, userId);
    const today = applicationDate || new Date().toISOString().split('T')[0];
    const appId = `app-${Date.now()}`;

    const newAppResult = await query(
      `INSERT INTO applications (
        id, user_id, company_id, company_name, position, job_type, work_arrangement,
        location, source, job_url, application_date, status, currency
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        appId,
        userId,
        company.id,
        company.name,
        position,
        'Full Time',
        'On-site',
        company.location || 'Indonesia',
        source || 'JobStreet',
        jobUrl || null,
        today,
        status || 'Applied',
        'IDR',
      ]
    );

    const evId = `ev-${Date.now()}`;
    await query(
      `INSERT INTO application_events (id, application_id, status, event_date, title, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [evId, appId, status || 'Applied', today, 'Application Submitted', `Applied via ${source || 'JobStreet'}`]
    );

    const a = newAppResult.rows[0];
    res.status(201).json({
      id: a.id,
      userId: a.user_id,
      companyId: a.company_id,
      companyName: a.company_name,
      position: a.position,
      jobType: a.job_type,
      workArrangement: a.work_arrangement,
      location: a.location,
      source: a.source,
      jobUrl: a.job_url,
      applicationDate: a.application_date ? a.application_date.toISOString().split('T')[0] : today,
      status: a.status,
      currency: a.currency,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error processing quick apply.' });
  }
});

app.put('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    const mapping = {
      position: 'position',
      jobType: 'job_type',
      workArrangement: 'work_arrangement',
      location: 'location',
      source: 'source',
      jobUrl: 'job_url',
      jobReference: 'job_reference',
      applicationDate: 'application_date',
      status: 'status',
      salaryMin: 'salary_min',
      salaryMax: 'salary_max',
      currency: 'currency',
      recruiterName: 'recruiter_name',
      recruiterEmail: 'recruiter_email',
      recruiterPhone: 'recruiter_phone',
      notes: 'notes',
    };

    for (const [key, col] of Object.entries(mapping)) {
      if (updates[key] !== undefined) {
        fields.push(`${col} = $${idx}`);
        values.push(updates[key]);
        idx++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);
    values.push(userId);

    const q = `UPDATE applications SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`;
    const result = await query(q, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found or unauthorized' });
    }

    const a = result.rows[0];
    res.json({
      id: a.id,
      userId: a.user_id,
      companyId: a.company_id,
      companyName: a.company_name,
      position: a.position,
      jobType: a.job_type,
      workArrangement: a.work_arrangement,
      location: a.location,
      source: a.source,
      jobUrl: a.job_url,
      jobReference: a.job_reference,
      applicationDate: a.application_date ? a.application_date.toISOString().split('T')[0] : '',
      status: a.status,
      salaryMin: a.salary_min ? parseFloat(a.salary_min) : undefined,
      salaryMax: a.salary_max ? parseFloat(a.salary_max) : undefined,
      currency: a.currency,
      recruiterName: a.recruiter_name,
      recruiterEmail: a.recruiter_email,
      recruiterPhone: a.recruiter_phone,
      notes: a.notes,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating application.' });
  }
});

app.put('/api/applications/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const currentRes = await query('SELECT * FROM applications WHERE id = $1 AND user_id = $2', [id, userId]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found or unauthorized' });
    }

    const cur = currentRes.rows[0];
    const newNotes = notes ? (cur.notes ? `${cur.notes}\n${notes}` : notes) : cur.notes;

    await query(
      'UPDATE applications SET status = $1, notes = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4',
      [status, newNotes, id, userId]
    );

    const evId = `ev-${Date.now()}`;
    await query(
      `INSERT INTO application_events (id, application_id, status, event_date, title, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [evId, id, status, today, `Status changed to ${status}`, notes || `Updated recruitment stage to ${status}`]
    );

    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating application status.' });
  }
});

app.delete('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deleteRes = await query('DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found or unauthorized' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting application.' });
  }
});

// Application Events
app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT e.* FROM application_events e
       JOIN applications a ON e.application_id = a.id
       WHERE a.user_id = $1 ORDER BY e.created_at DESC`,
      [req.user.id]
    );
    const events = result.rows.map(e => ({
      id: e.id,
      applicationId: e.application_id,
      status: e.status,
      eventDate: e.event_date ? e.event_date.toISOString().split('T')[0] : '',
      title: e.title,
      description: e.description,
      createdAt: e.created_at,
    }));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching events.' });
  }
});

// Interviews
app.get('/api/interviews', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT i.* FROM interview_schedules i
       JOIN applications a ON i.application_id = a.id
       WHERE a.user_id = $1 ORDER BY i.date ASC, i.time ASC`,
      [req.user.id]
    );
    const interviews = result.rows.map(i => ({
      id: i.id,
      applicationId: i.application_id,
      type: i.type,
      date: i.date ? i.date.toISOString().split('T')[0] : '',
      time: i.time,
      location: i.location,
      meetingUrl: i.meeting_url,
      notes: i.notes,
      createdAt: i.created_at,
    }));
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching interviews.' });
  }
});

app.post('/api/interviews', authenticateToken, async (req, res) => {
  try {
    const { applicationId, type, date, time, location, meetingUrl, notes } = req.body;
    const userId = req.user.id;

    // Verify application belongs to user
    const appRes = await query('SELECT status FROM applications WHERE id = $1 AND user_id = $2', [applicationId, userId]);
    if (appRes.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized application access' });
    }

    const id = `int-${Date.now()}`;
    const result = await query(
      `INSERT INTO interview_schedules (id, application_id, type, date, time, location, meeting_url, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, applicationId, type, date, time, location || null, meetingUrl || null, notes || null]
    );

    if (['Applied', 'Screening', 'Saved'].includes(appRes.rows[0].status)) {
      await query(
        'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
        ['Interview', applicationId, userId]
      );
      const evId = `ev-${Date.now()}`;
      await query(
        `INSERT INTO application_events (id, application_id, status, event_date, title, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [evId, applicationId, 'Interview', date, 'Status changed to Interview', `Scheduled ${type} on ${date}`]
      );
    }

    const i = result.rows[0];
    res.status(201).json({
      id: i.id,
      applicationId: i.application_id,
      type: i.type,
      date: i.date ? i.date.toISOString().split('T')[0] : date,
      time: i.time,
      location: i.location,
      meetingUrl: i.meeting_url,
      notes: i.notes,
      createdAt: i.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error creating interview schedule.' });
  }
});

app.delete('/api/interviews/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deleteRes = await query(
      `DELETE FROM interview_schedules WHERE id = $1 AND application_id IN (SELECT id FROM applications WHERE user_id = $2) RETURNING id`,
      [id, userId]
    );
    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Interview not found or unauthorized' });
    }
    res.json({ message: 'Interview deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting interview.' });
  }
});

// Follow Ups
app.get('/api/followups', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT f.* FROM follow_ups f
       JOIN applications a ON f.application_id = a.id
       WHERE a.user_id = $1 ORDER BY f.follow_up_date ASC`,
      [req.user.id]
    );
    const followUps = result.rows.map(f => ({
      id: f.id,
      applicationId: f.application_id,
      followUpDate: f.follow_up_date ? f.follow_up_date.toISOString().split('T')[0] : '',
      contactMethod: f.contact_method,
      contactPerson: f.contact_person,
      message: f.message,
      status: f.status,
      createdAt: f.created_at,
    }));
    res.json(followUps);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching followups.' });
  }
});

app.post('/api/followups', authenticateToken, async (req, res) => {
  try {
    const { applicationId, followUpDate, contactMethod, contactPerson, message, status } = req.body;
    const userId = req.user.id;

    // FIX FINDING #11: Input length limits on follow-up fields
    if (contactPerson && contactPerson.length > 100) return res.status(400).json({ error: 'Contact person must be 100 characters or fewer' });
    if (message && message.length > 2000) return res.status(400).json({ error: 'Message must be 2000 characters or fewer' });

    // Verify application belongs to user
    const appRes = await query('SELECT id FROM applications WHERE id = $1 AND user_id = $2', [applicationId, userId]);
    if (appRes.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized application access' });
    }

    const id = `fol-${Date.now()}`;
    const result = await query(
      `INSERT INTO follow_ups (id, application_id, follow_up_date, contact_method, contact_person, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, applicationId, followUpDate, contactMethod, contactPerson || null, message || null, status || 'Upcoming']
    );
    const f = result.rows[0];
    res.status(201).json({
      id: f.id,
      applicationId: f.application_id,
      followUpDate: f.follow_up_date ? f.follow_up_date.toISOString().split('T')[0] : followUpDate,
      contactMethod: f.contact_method,
      contactPerson: f.contact_person,
      message: f.message,
      status: f.status,
      createdAt: f.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error creating follow-up.' });
  }
});

app.put('/api/followups/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateRes = await query(
      `UPDATE follow_ups SET status = $1 WHERE id = $2 AND application_id IN (SELECT id FROM applications WHERE user_id = $3) RETURNING id`,
      [req.body.status, id, userId]
    );
    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'FollowUp not found or unauthorized' });
    }
    res.json({ message: 'FollowUp status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating follow-up status.' });
  }
});

app.delete('/api/followups/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deleteRes = await query(
      `DELETE FROM follow_ups WHERE id = $1 AND application_id IN (SELECT id FROM applications WHERE user_id = $2) RETURNING id`,
      [id, userId]
    );
    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ error: 'FollowUp not found or unauthorized' });
    }
    res.json({ message: 'FollowUp deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting follow-up.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server JobTracker PostgreSQL running securely on http://localhost:${PORT}`);
});
