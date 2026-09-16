const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const isRemote = connectionString && (connectionString.includes('supabase') || connectionString.includes('sslmode=require') || !connectionString.includes('localhost'));

const poolConfig = connectionString
  ? { 
      connectionString, 
      ssl: isRemote ? { rejectUnauthorized: false } : false 
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'jobtracker',
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

const query = (text, params) => pool.query(text, params);

const initDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database!');

    // Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(50),
        location VARCHAR(100),
        portfolio_url TEXT,
        github_url TEXT,
        linkedin_url TEXT,
        preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        website TEXT,
        location VARCHAR(100),
        industry VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_id VARCHAR(50) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        company_name VARCHAR(150) NOT NULL,
        position VARCHAR(150) NOT NULL,
        job_type VARCHAR(50) NOT NULL,
        work_arrangement VARCHAR(50) NOT NULL,
        location VARCHAR(100),
        source VARCHAR(50) NOT NULL,
        job_url TEXT,
        job_reference VARCHAR(100),
        application_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        salary_min NUMERIC,
        salary_max NUMERIC,
        currency VARCHAR(10) DEFAULT 'IDR',
        recruiter_name VARCHAR(100),
        recruiter_email VARCHAR(100),
        recruiter_phone VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS application_events (
        id VARCHAR(50) PRIMARY KEY,
        application_id VARCHAR(50) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        event_date DATE NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS interview_schedules (
        id VARCHAR(50) PRIMARY KEY,
        application_id VARCHAR(50) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(10) NOT NULL,
        location VARCHAR(150),
        meeting_url TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS follow_ups (
        id VARCHAR(50) PRIMARY KEY,
        application_id VARCHAR(50) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        follow_up_date DATE NOT NULL,
        contact_method VARCHAR(50) NOT NULL,
        contact_person VARCHAR(100),
        message TEXT,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS attachments (
        id VARCHAR(50) PRIMARY KEY,
        application_id VARCHAR(50) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_url TEXT,
        upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('PostgreSQL schema verification/creation completed.');

    // Seed default user if not exists
    const userRes = await client.query('SELECT id FROM users WHERE id = $1', ['user-1']);
    if (userRes.rowCount === 0) {
      console.log('Seeding initial default user...');
      await client.query(
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
    }

    client.release();
  } catch (err) {
    console.error('PostgreSQL Connection/Initialization Failed:');
    console.error(err.message);
    console.warn('Pastikan PostgreSQL server berjalan di host/port yang dikonfigurasi di server/.env!');
  }
};

module.exports = {
  pool,
  query,
  initDatabase,
};
