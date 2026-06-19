const path = require('path');
const fs = require('fs');

let dbType = 'memory';
let pgPool = null;
let sqliteDb = null;
let supabaseClient = null;

const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (databaseUrl) {
  dbType = 'postgres';
  console.log('Database configuration: Using Supabase/Postgres');
  try {
    const { Pool } = require('pg');
    pgPool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
  } catch (err) {
    console.error('Failed to load pg module:', err);
    dbType = 'memory';
  }
} else if (supabaseUrl && supabaseKey) {
  dbType = 'supabase';
  console.log('Database configuration: Using Supabase JS Client');
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.error('Failed to load @supabase/supabase-js module:', err);
    dbType = 'memory';
  }
} else {
  dbType = 'sqlite';
  console.log('Database configuration: Using local SQLite');
  try {
    const sqlite3 = require('sqlite3').verbose();
    const dbDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'database.sqlite');
    sqliteDb = new sqlite3.Database(dbPath);
  } catch (err) {
    console.error('Failed to load sqlite3. Falling back to memory database.', err);
    dbType = 'memory';
  }
}

// Universal query utility supporting both engines (postgres and sqlite)
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (dbType === 'postgres') {
      if (!pgPool) return reject(new Error('Postgres pool not initialized'));
      pgPool.query(sql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows);
      });
    } else if (dbType === 'sqlite') {
      if (!sqliteDb) return reject(new Error('SQLite database not initialized'));
      const isSelect = sql.trim().toLowerCase().startsWith('select');
      if (isSelect) {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      } else {
        sqliteDb.run(sql, params, function(err) {
          if (err) return reject(err);
          resolve({ lastID: this.lastID, changes: this.changes });
        });
      }
    } else {
      reject(new Error(`Query not supported for database type: ${dbType}`));
    }
  });
}

// Verify or create schema on boot
async function initDb() {
  if (dbType === 'postgres') {
    const createTableSqlPostgres = `
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        specialty TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    try {
      await query(createTableSqlPostgres);
      console.log('Database: leads table checked/created successfully (Postgres).');
    } catch (error) {
      console.error('Error initializing database (Postgres):', error);
    }
  } else if (dbType === 'sqlite') {
    const createTableSqlSqlite = `
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        specialty TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    try {
      await query(createTableSqlSqlite);
      console.log('Database: leads table checked/created successfully (SQLite).');
    } catch (error) {
      console.error('Error initializing database (SQLite):', error);
    }
  } else if (dbType === 'supabase') {
    console.log('Database: Using Supabase Client. Please verify that the "leads" table exists in your Supabase project.');
  } else {
    console.log('Database: Using in-memory fallback. Data will not persist across restarts.');
  }
}

module.exports = {
  query,
  initDb,
  getDbType: () => dbType,
  getSupabaseClient: () => supabaseClient
};
