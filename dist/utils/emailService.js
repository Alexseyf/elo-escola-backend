"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarEmailSenhaPadrao = enviarEmailSenhaPadrao;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function enviarEmailSenhaPadrao(email, nome, senhaPadrao) {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: `"ELO App" <${process.env.EMAIL_FROM || "noreply@eloapp.com"}>`,
        to: email,
        subject: "Bem-vindo(a) ao ELO Escola- Sua senha de acesso",
        priority: "high",
        headers: {
            'X-Priority': '1',
            'Importance': 'high',
            'X-MSMail-Priority': 'High',
            'X-Mailer': 'ELO App System Mailer'
        },
        text: `Olá ${nome},
    
Bem-vindo(a) ao Elo Escola, seu app escolar!

Sua conta foi criada com sucesso. Para o seu primeiro acesso, utilize a senha temporária abaixo:

Senha: ${senhaPadrao}

Importante: Ao fazer login, você será solicitado a alterar esta senha. Por motivos de segurança, escolha uma senha forte e diferente da senha temporária.

Atenciosamente,
Equipe Elo Escola`,
        html: `<h2>Olá ${nome},</h2>
    <p>Bem-vindo(a) ao Elo Escola!</p>
    <p>Sua conta foi criada com sucesso. Para o seu primeiro acesso, utilize a senha temporária abaixo:</p>
    <p><strong>Senha: ${senhaPadrao}</strong></p>
    <p><em>Importante: Ao fazer login, você será solicitado a alterar esta senha. Por motivos de segurança, escolha uma senha forte e diferente da senha temporária.</em></p>
    <p>Ela deve ter:</p>
    <ul>
      <li>8 caracteres ou mais</li>
      <li>1 letra maiúscula</li>
      <li>1 letra minúscula</li>
      <li>1 número</li>
      <li>1 caractere especial (ex: @, #, $, etc.)</li>
    </ul>
    <br>
    <p>Atenciosamente,<br>Equipe Elo Escola</p>`
    };
    await transporter.sendMail(mailOptions);
}
