const leadModel = require('../models/leadModel');
const nodemailer = require('nodemailer');

// POST /api/leads
async function submitLead(req, res) {
  try {
    const { name, email, phone, whatsapp_contact, company, company_size, services, investment, specialty, message } = req.body;
    
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
      whatsapp_contact: whatsapp_contact ? whatsapp_contact.trim() : '',
      company: company ? company.trim() : '',
      company_size: company_size ? company_size.trim() : '',
      services: services ? services.trim() : '',
      investment: investment ? investment.trim() : '',
      specialty: specialty ? specialty.trim() : '',
      message: message ? message.trim() : ''
    });

    // Enviar e-mail de notificação
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });

      const mailOptions = {
        from: `"${name}" <${emailUser}>`, // Enviado do próprio email autenticado para evitar bloqueio
        replyTo: email,
        to: emailUser, // Recebe no próprio email (agenciaveny@gmail.com)
        subject: `Novo Lead: ${name} - Studio Veny`,
        html: `
          <h2>Novo Contato Recebido pelo Site</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Telefone / WhatsApp:</strong> ${phone}</p>
          <p><strong>Contato via WhatsApp?:</strong> ${whatsapp_contact || 'Não informado'}</p>
          <p><strong>Empresa:</strong> ${company || 'Não informado'}</p>
          <p><strong>Tamanho da Empresa:</strong> ${company_size || 'Não informado'}</p>
          <p><strong>Serviços Desejados:</strong> ${services || 'Não informado'}</p>
          <p><strong>Investimento / Renda:</strong> ${investment || 'Não informado'}</p>
          <br>
          <p><strong>Explicação / Objetivos:</strong></p>
          <p>${message || 'Nenhuma mensagem adicional.'}</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('E-mail de notificação enviado com sucesso para', emailUser);
      } catch (mailError) {
        console.error('Erro ao enviar e-mail de notificação:', mailError);
        // Não falha a requisição se o email falhar, pois o lead já foi salvo no BD
      }
    } else {
      console.warn('EMAIL_USER ou EMAIL_PASS não configurados. E-mail de notificação não enviado.');
    }
    
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
