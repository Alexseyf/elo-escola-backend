import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { TIPO_USUARIO } from '@prisma/client';
import { checkToken } from '../../shared/middlewares/checkToken';
import { checkRoles } from '../../shared/middlewares/checkRoles';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: {
        email,
        roles: {
          some: {
            role: { tipo: TIPO_USUARIO.PLATFORM_ADMIN }
          }
        }
      },
      include: {
        roles: { include: { role: true } }
      }
    });

    if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    if (!usuario.isAtivo) {
      return res.status(401).json({ erro: 'Usuário inativo' });
    }

    const roles = usuario.roles.map(ur => ur.role.tipo);

    const token = jwt.sign(
      {
        userLogadoId: usuario.id,
        userLogadoNome: usuario.nome,
        schoolId: null,
        roles: roles,
      },
      process.env.JWT_KEY as string,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      roles,
      token,
      primeiroAcesso: !usuario.senhaAlterada,
      scope: 'platform',
    });

    await prisma.log.create({
      data: {
        descricao: 'Platform Login',
        complemento: `PLATFORM_ADMIN: ${usuario.email}`,
        usuarioId: usuario.id,
        schoolId: usuario.schoolId ?? undefined
      }
    }).catch(() => {
    });

  } catch (error) {
    console.error('Erro no Platform Login:', error);
    res.status(500).json({ erro: 'Erro interno' });
  }
});

router.get('/schools', checkToken, checkRoles([TIPO_USUARIO.PLATFORM_ADMIN]), async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: {
            usuarios: true,
            alunos: true,
            turmas: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(schools);
  } catch (error) {
    console.error('Erro ao listar escolas:', error);
    res.status(500).json({ erro: 'Erro interno' });
  }
});

router.get('/users', checkToken, checkRoles([TIPO_USUARIO.PLATFORM_ADMIN]), async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      include: {
        school: { select: { id: true, name: true, slug: true } },
        roles: { include: { role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map(u => ({
      ...u,
      senha: undefined,
      roles: u.roles.map(ur => ur.role.tipo)
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ erro: 'Erro interno' });
  }
});

router.get('/metrics', checkToken, checkRoles([TIPO_USUARIO.PLATFORM_ADMIN]), async (req, res) => {
  try {
    const [schoolCount, userCount, studentCount, activeSchools] = await Promise.all([
      prisma.school.count(),
      prisma.usuario.count(),
      prisma.aluno.count(),
      prisma.school.count({ where: { active: true } })
    ]);

    res.status(200).json({
      totalSchools: schoolCount,
      activeSchools,
      totalUsers: userCount,
      totalStudents: studentCount
    });
  } catch (error) {
    console.error('Erro ao obter métricas:', error);
    res.status(500).json({ erro: 'Erro interno' });
  }
});

export const platformRouter = router;
