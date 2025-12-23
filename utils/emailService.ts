import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

export async function enviarEmailSenhaPadrao(email: string, nome: string, senhaPadrao: string) {
  const transporter = nodemailer.createTransport({
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
    priority: "high" as const,
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
