import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';

const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  const msg = "Login ou senha incorretos";

  if (!email || !senha) {
    res.status(400).json({ status: "error", message: "Email e senha são obrigatórios" });
    return;
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: {
        email: email,
        isAtivo: true
      },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        school: true
      }
    });

    if (usuario && bcrypt.compareSync(senha, usuario.senha)) {
      if (!usuario.isAtivo) {
         res.status(401).json({ status: "error", message: "Usuário inativo. Contate a administração." });
         return;
      }

      const roles = usuario.roles.map(ur => ur.role.tipo);

      const token = jwt.sign(
        {
          userLogadoId: usuario.id,
          userLogadoNome: usuario.nome,
          schoolId: usuario.schoolId,
          roles: roles,
        },
        env.JWT_KEY,
        { expiresIn: "30d" },
      );

      const primeiroAcesso = !usuario.senhaAlterada;
      
      const resposta = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        roles: roles,
        token,
        primeiroAcesso,
        schoolSlug: usuario.school?.slug ?? null
      };

      res.status(200).json(resposta);

      await prisma.log.create({
        data: {
          descricao: "Login Realizado",
          complemento: `Usuário: ${usuario.email}`,
          usuarioId: usuario.id,
          schoolId: usuario.schoolId ?? undefined
        },
      });
      return;
    }

    res.status(400).json({ status: "error", message: msg });
  } catch (error) {
    console.error("Erro no Login:", error);
    res.status(500).json({ status: "error", message: "Erro interno no servidor ao realizar login" });
  }
});

export { authRouter };
