const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { query, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database schema on startup
initDatabase();

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now, database: 'PostgreSQL' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// User Profile
app.get('/api/user', async (req, res) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', ['user-1']);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      portfolioUrl: user.portfolio_url,
      githubUrl: user.github_url,
      linkedinUrl: user.linkedin_url,
      preferences: typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/user', async (req, res) => {
  try {
    const { name, email, phone, location, portfolioUrl, githubUrl, linkedinUrl, preferences } = req.body;
    
    // Fetch current user first
    const current = await query('SELECT * FROM users WHERE id = $1', ['user-1']);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const cur = current.rows[0];
    const newName = name !== undefined ? name : cur.name;
    const newEmail = email !== undefined ? email : cur.email;
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
      [newName, newEmail, newPhone, newLoc, newPort, newGit, newLin, newPref, 'user-1']
    );

    const user = result.rows[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      portfolioUrl: user.portfolio_url,
      githubUrl: user.github_url,
      linkedinUrl: user.linkedin_url,
      preferences: typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Companies
app.get('/api/companies', async (req, res) => {
  try {
    const result = await query('SELECT * FROM companies WHERE user_id = $1 ORDER BY created_at DESC', ['user-1']);
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
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { name, website, location, industry, notes } = req.body;
    const id = `comp-${Date.now()}`;
    const result = await query(
      `INSERT INTO companies (id, user_id, name, website, location, industry, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, 'user-1', name, website || null, location || null, industry || null, notes || null]
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
    res.status(500).json({ error: err.message });
  }
});

// Applications
app.get('/api/applications', async (req, res) => {
  try {
    const result = await query('SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC', ['user-1']);
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
    res.status(500).json({ error: err.message });
  }
});

// Helper for finding or creating company
async function findOrCreateCompanyDB(companyName, userId = 'user-1') {
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

app.post('/api/applications', async (req, res) => {
  try {
    const appData = req.body;
    const company = await findOrCreateCompanyDB(appData.companyName || 'Unknown Company');
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
        'user-1',
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

    // Initial Event
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
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/applications/quick-apply', async (req, res) => {
  try {
    const { companyName, position, source, jobUrl, applicationDate, status } = req.body;
    const company = await findOrCreateCompanyDB(companyName);
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
        'user-1',
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
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
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

    const q = `UPDATE applications SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await query(q, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
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
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const currentRes = await query('SELECT * FROM applications WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const cur = currentRes.rows[0];
    const newNotes = notes ? (cur.notes ? `${cur.notes}\n${notes}` : notes) : cur.notes;

    await query(
      'UPDATE applications SET status = $1, notes = $2, updated_at = NOW() WHERE id = $3',
      [status, newNotes, id]
    );

    const evId = `ev-${Date.now()}`;
    await query(
      `INSERT INTO application_events (id, application_id, status, event_date, title, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [evId, id, status, today, `Status changed to ${status}`, notes || `Updated recruitment stage to ${status}`]
    );

    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM applications WHERE id = $1', [id]);
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Application Events
app.get('/api/events', async (req, res) => {
  try {
    const result = await query(
      `SELECT e.* FROM application_events e
       JOIN applications a ON e.application_id = a.id
       WHERE a.user_id = $1 ORDER BY e.created_at DESC`,
      ['user-1']
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
    res.status(500).json({ error: err.message });
  }
});

// Interviews
app.get('/api/interviews', async (req, res) => {
  try {
    const result = await query(
      `SELECT i.* FROM interview_schedules i
       JOIN applications a ON i.application_id = a.id
       WHERE a.user_id = $1 ORDER BY i.date ASC, i.time ASC`,
      ['user-1']
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
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/interviews', async (req, res) => {
  try {
    const { applicationId, type, date, time, location, meetingUrl, notes } = req.body;
    const id = `int-${Date.now()}`;
    const result = await query(
      `INSERT INTO interview_schedules (id, application_id, type, date, time, location, meeting_url, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, applicationId, type, date, time, location || null, meetingUrl || null, notes || null]
    );

    // Auto update status if Applied/Screening
    const appRes = await query('SELECT status FROM applications WHERE id = $1', [applicationId]);
    if (appRes.rows.length > 0 && ['Applied', 'Screening', 'Saved'].includes(appRes.rows[0].status)) {
      await query(
        'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2',
        ['Interview', applicationId]
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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/interviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM interview_schedules WHERE id = $1', [id]);
    res.json({ message: 'Interview deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Follow Ups
app.get('/api/followups', async (req, res) => {
  try {
    const result = await query(
      `SELECT f.* FROM follow_ups f
       JOIN applications a ON f.application_id = a.id
       WHERE a.user_id = $1 ORDER BY f.follow_up_date ASC`,
      ['user-1']
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
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/followups', async (req, res) => {
  try {
    const { applicationId, followUpDate, contactMethod, contactPerson, message, status } = req.body;
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
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/followups/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await query('UPDATE follow_ups SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: 'FollowUp status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/followups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM follow_ups WHERE id = $1', [id]);
    res.json({ message: 'FollowUp deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed / Reset Demo Data
app.post('/api/reset-demo', async (req, res) => {
  try {
    // Clear existing data for user-1
    await query("DELETE FROM users WHERE id = 'user-1'");

    // Re-insert user-1
    await query(
      `INSERT INTO users (id, name, email, phone, location, portfolio_url, github_url, linkedin_url, preferences)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        'user-1',
        'Hatta',
        'hatta@example.com',
        '+62 812-3456-7890',
        'Surabaya, Indonesia',
        'https://hatta.dev',
        'https://github.com/hatta',
        'https://linkedin.com/in/hatta',
        JSON.stringify({
          defaultStatus: 'Applied',
          defaultSource: 'JobStreet',
          currency: 'IDR',
          dateFormat: 'DD MMM YYYY',
          theme: 'light',
        }),
      ]
    );

    // Seed Companies
    const companies = [
      { id: 'comp-1', name: 'PT ABC Indonesia', location: 'Surabaya', website: 'https://ptabc.co.id' },
      { id: 'comp-2', name: 'PT XYZ Tech Solutions', location: 'Jakarta', website: 'https://xyztech.com' },
      { id: 'comp-3', name: 'PT DEF Creative Tech', location: 'Bandung', website: 'https://defcreative.io' },
      { id: 'comp-4', name: 'Gojek (GoTo Group)', location: 'Jakarta', website: 'https://goto.com' },
      { id: 'comp-5', name: 'Tokopedia', location: 'Jakarta', website: 'https://tokopedia.com' },
    ];

    for (const c of companies) {
      await query(
        `INSERT INTO companies (id, user_id, name, location, website) VALUES ($1, $2, $3, $4, $5)`,
        [c.id, 'user-1', c.name, c.location, c.website]
      );
    }

    // Seed Applications
    const apps = [
      {
        id: 'app-1', companyId: 'comp-1', companyName: 'PT ABC Indonesia', position: 'Full Stack Developer',
        jobType: 'Full Time', workArrangement: 'Hybrid', location: 'Surabaya', source: 'JobStreet',
        jobUrl: 'https://jobstreet.co.id/job/123456', jobReference: 'JS-8902', applicationDate: '2026-09-15',
        status: 'Interview', salaryMin: 6000000, salaryMax: 9000000, currency: 'IDR', recruiterName: 'Siti Rahma',
        recruiterEmail: 'hr@ptabc.co.id', recruiterPhone: '+62 811-9988-7766', notes: 'Menunggu jadwal interview user. Sangat berminat dengan posisi ini.'
      },
      {
        id: 'app-2', companyId: 'comp-2', companyName: 'PT XYZ Tech Solutions', position: 'IT Programmer',
        jobType: 'Full Time', workArrangement: 'Remote', location: 'Jakarta', source: 'LinkedIn',
        jobUrl: 'https://linkedin.com/jobs/view/987654321', applicationDate: '2026-09-14', status: 'Screening',
        salaryMin: 7000000, salaryMax: 10000000, currency: 'IDR', recruiterName: 'Budi Santoso', notes: 'Sudah di-contact HR via WhatsApp.'
      },
      {
        id: 'app-3', companyId: 'comp-3', companyName: 'PT DEF Creative Tech', position: 'Front-End Developer',
        jobType: 'Contract', workArrangement: 'On-site', location: 'Bandung', source: 'Glints',
        jobUrl: 'https://glints.com/id/opportunities/jobs/456789', applicationDate: '2026-09-12', status: 'Rejected',
        salaryMin: 5500000, salaryMax: 7500000, currency: 'IDR', notes: 'Kualifikasi pengalaman Vue3 belum mencukupi.'
      },
      {
        id: 'app-4', companyId: 'comp-4', companyName: 'Gojek (GoTo Group)', position: 'Software Engineer - Frontend',
        jobType: 'Full Time', workArrangement: 'Hybrid', location: 'Jakarta South', source: 'Company Website',
        jobUrl: 'https://careers.goto.com/jobs/se-fe-2026', applicationDate: '2026-09-10', status: 'Assessment',
        salaryMin: 12000000, salaryMax: 18000000, currency: 'IDR', recruiterName: 'Anita Wijaya', notes: 'HackerRank test link received. Deadline 18 September.'
      },
      {
        id: 'app-5', companyId: 'comp-5', companyName: 'Tokopedia', position: 'React Frontend Specialist',
        jobType: 'Full Time', workArrangement: 'Remote', location: 'Jakarta', source: 'LinkedIn',
        jobUrl: 'https://linkedin.com/jobs/view/112233', applicationDate: '2026-09-08', status: 'Offer',
        salaryMin: 14000000, salaryMax: 16000000, currency: 'IDR', notes: 'Offering letter dikirimkan via email. Perlu negosiasi fasilitas.'
      }
    ];

    for (const a of apps) {
      await query(
        `INSERT INTO applications (
          id, user_id, company_id, company_name, position, job_type, work_arrangement,
          location, source, job_url, job_reference, application_date, status, salary_min, salary_max,
          currency, recruiter_name, recruiter_email, recruiter_phone, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [
          a.id, 'user-1', a.companyId, a.companyName, a.position, a.jobType, a.workArrangement,
          a.location, a.source, a.jobUrl, a.jobReference || null, a.applicationDate, a.status,
          a.salaryMin, a.salaryMax, a.currency, a.recruiterName || null, a.recruiterEmail || null,
          a.recruiterPhone || null, a.notes || null
        ]
      );
    }

    // Seed Events
    const events = [
      { id: 'ev-1', applicationId: 'app-1', status: 'Applied', eventDate: '2026-09-15', title: 'Application Submitted', description: 'Lamaran dikirim melalui JobStreet portal.' },
      { id: 'ev-2', applicationId: 'app-1', status: 'Screening', eventDate: '2026-09-15', title: 'HR Contacted', description: 'HR WhatsApp mengenai konfirmasi ketersediaan gaji.' },
      { id: 'ev-3', applicationId: 'app-1', status: 'Interview', eventDate: '2026-09-15', title: 'Interview Scheduled', description: 'Undangan Technical Interview dikirimkan.' },
    ];

    for (const e of events) {
      await query(
        `INSERT INTO application_events (id, application_id, status, event_date, title, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [e.id, e.applicationId, e.status, e.eventDate, e.title, e.description]
      );
    }

    // Seed Interviews
    const interviews = [
      { id: 'int-1', applicationId: 'app-1', type: 'Technical Interview', date: '2026-09-25', time: '13:00', location: 'Google Meet', meetingUrl: 'https://meet.google.com/abc-defg-hij', notes: 'Persiapkan live coding React + Node.js' },
      { id: 'int-2', applicationId: 'app-4', type: 'Technical Test', date: '2026-09-18', time: '09:00', location: 'HackerRank Online', meetingUrl: 'https://hackerrank.com/test/goto-2026', notes: '2 Soal Data Structures & Algorithms' }
    ];

    for (const i of interviews) {
      await query(
        `INSERT INTO interview_schedules (id, application_id, type, date, time, location, meeting_url, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [i.id, i.applicationId, i.type, i.date, i.time, i.location, i.meetingUrl, i.notes]
      );
    }

    // Seed Followups
    const followups = [
      { id: 'fol-1', applicationId: 'app-1', followUpDate: '2026-09-29', contactMethod: 'WhatsApp', contactPerson: 'Siti Rahma (HR)', message: 'Halo Mbak Siti, menanyakan kabar kelanjutan hasil technical interview PT ABC.', status: 'Upcoming' },
      { id: 'fol-2', applicationId: 'app-2', followUpDate: '2026-09-16', contactMethod: 'WhatsApp', contactPerson: 'Budi Santoso', message: 'Follow-up status screening berkas CV.', status: 'Upcoming' }
    ];

    for (const f of followups) {
      await query(
        `INSERT INTO follow_ups (id, application_id, follow_up_date, contact_method, contact_person, message, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [f.id, f.applicationId, f.followUpDate, f.contactMethod, f.contactPerson, f.message, f.status]
      );
    }

    res.json({ message: 'Demo data seeded into PostgreSQL successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server JobTracker PostgreSQL running on http://localhost:${PORT}`);
});
