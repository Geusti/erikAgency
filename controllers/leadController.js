const leadModel = require('../models/leadModel');

// POST /api/leads
async function submitLead(req, res) {
  try {
    const { name, email, phone, specialty, message } = req.body;
    
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Nome, E-mail e Telefone são campos obrigatórios.' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Por favor, insira um e-mail válido.' });
    }
    
    await leadModel.createLead({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      specialty: specialty ? specialty.trim() : '',
      message: message ? message.trim() : ''
    });
    
    return res.status(201).json({ success: true, message: 'Dados enviados com sucesso!' });
  } catch (error) {
    console.error('Error in submitLead:', error);
    return res.status(500).json({ error: 'Erro interno do servidor ao salvar os dados.' });
  }
}

// GET /api/leads (Secure admin lookup)
async function listLeads(req, res) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'estetica123';
    const providedPassword = req.headers['x-admin-password'] || req.query.password;
    
    if (providedPassword !== adminPassword) {
      return res.status(401).json({ error: 'Senha incorreta. Acesso negado.' });
    }
    
    const leads = await leadModel.getAllLeads();
    return res.json({ success: true, leads });
  } catch (error) {
    console.error('Error in listLeads:', error);
    return res.status(500).json({ error: 'Erro ao listar as leads do banco de dados.' });
  }
}

module.exports = {
  submitLead,
  listLeads
};
