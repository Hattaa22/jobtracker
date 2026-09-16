const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;

const isRemote = (connectionString && (connectionString.includes('supabase') || connectionString.includes('sslmode=require') || !connectionString.includes('localhost')))
  || (process.env.DB_HOST && process.env.DB_HOST !== 'localhost');

const poolConfig = connectionString
  ? { 
      connectionString, 
      ssl: isRemote ? { rejectUnauthorized: false } : false 
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'jobtracker',
      ssl: isRemote ? { rejectUnauthorized: false } : false,
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
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        avatar_url TEXT,
        provider VARCHAR(20) DEFAULT 'email',
        provider_id TEXT,
        phone VARCHAR(50),
        location VARCHAR(100),
        portfolio_url TEXT,
        github_url TEXT,
        linkedin_url TEXT,
        preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'email';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;


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

    // FIX FINDING #15: Removed hardcoded seed user — users must register via /api/auth/register
    // The seed user 'user-1' had no password_hash and could not log in.

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
