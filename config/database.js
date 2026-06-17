const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let dbType = 'sqlite';
let pgPool = null;
let sqliteDb = null;

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  dbType = 'postgres';
  console.log('Database configuration: Using Supabase/Postgres');
  pgPool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  dbType = 'sqlite';
  console.log('Database configuration: Using local SQLite');
  const dbDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'database.sqlite');
  sqliteDb = new sqlite3.Database(dbPath);
}

// Universal query utility supporting both engines
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (dbType === 'postgres') {
      pgPool.query(sql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows);
      });
    } else {
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
    }
  });
}

// Verify or create schema on boot
async function initDb() {
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
    if (dbType === 'postgres') {
      await query(createTableSqlPostgres);
    } else {
      await query(createTableSqlSqlite);
    }
    console.log('Database: leads table checked/created successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = {
  query,
  initDb,
  getDbType: () => dbType
};
