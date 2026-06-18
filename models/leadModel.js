const db = require('../config/database');

async function createLead({ name, email, phone, specialty, message }) {
  const dbType = db.getDbType();
  let sql = '';
  const params = [name, email, phone, specialty, message];
  
  if (dbType === 'postgres') {
    sql = `
      INSERT INTO leads (name, email, phone, specialty, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
  } else {
    sql = `
      INSERT INTO leads (name, email, phone, specialty, message)
      VALUES (?, ?, ?, ?, ?);
    `;
  }
  
  const result = await db.query(sql, params);
  return result;
}

async function getAllLeads() {
  const sql = `
    SELECT id, name, email, phone, specialty, message, created_at
    FROM leads
    ORDER BY created_at DESC;
  `;
  return await db.query(sql);
}

module.exports = {
  createLead,
  getAllLeads
};
