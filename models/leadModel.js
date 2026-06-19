const db = require('../config/database');

// In-memory fallback array
const memoryLeads = [];

async function createLead({ name, email, phone, specialty, message }) {
  const dbType = db.getDbType();
  
  if (dbType === 'postgres') {
    const sql = `
      INSERT INTO leads (name, email, phone, specialty, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    return await db.query(sql, [name, email, phone, specialty, message]);
  } else if (dbType === 'sqlite') {
    const sql = `
      INSERT INTO leads (name, email, phone, specialty, message)
      VALUES (?, ?, ?, ?, ?);
    `;
    return await db.query(sql, [name, email, phone, specialty, message]);
  } else if (dbType === 'supabase') {
    const supabase = db.getSupabaseClient();
    const { data, error } = await supabase
      .from('leads')
      .insert([{ name, email, phone, specialty, message }])
      .select();
    
    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    return data;
  } else {
    // memory fallback
    const newLead = {
      id: memoryLeads.length + 1,
      name,
      email,
      phone,
      specialty,
      message,
      created_at: new Date().toISOString()
    };
    memoryLeads.push(newLead);
    return [newLead];
  }
}

async function getAllLeads() {
  const dbType = db.getDbType();
  
  if (dbType === 'postgres' || dbType === 'sqlite') {
    const sql = `
      SELECT id, name, email, phone, specialty, message, created_at
      FROM leads
      ORDER BY created_at DESC;
    `;
    return await db.query(sql);
  } else if (dbType === 'supabase') {
    const supabase = db.getSupabaseClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase select error:', error);
      throw error;
    }
    return data || [];
  } else {
    // memory fallback
    return [...memoryLeads].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

module.exports = {
  createLead,
  getAllLeads
};
