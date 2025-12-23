import jwt from "jsonwebtoken"
import { Router } from "express"
import bcrypt from "bcrypt"
import { prisma } from '../config/prisma'
import { tenantMiddleware } from '../src/shared/middlewares/tenant.middleware';

const router = Router()

router.post("/", tenantMiddleware, async (req, res) => {
  const { email, senha } = req.body
  const schoolId = req.schoolId

  const msg = "Login ou senha incorretos"

  if (!email || !senha) {
    res.status(400).json({ erro: "Email e senha são obrigatórios" })
    return
  }

  if (!schoolId) {
    res.status(400).json({ erro: "Escola não identificada (Header ou Domínio)" })
    return
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: {
        email_schoolId: {
            email: email,
            schoolId: schoolId
        }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (usuario && bcrypt.compareSync(senha, usuario.senha)) {
      if (!usuario.isAtivo) {
         return res.status(401).json({ erro: "Usuário inativo. Contate a administração." })
      }

      const roles = usuario.roles.map(ur => ur.role.tipo)

      const token = jwt.sign(
        {
          userLogadoId: usuario.id,
          userLogadoNome: usuario.nome,
          schoolId: usuario.schoolId,
          roles: roles,
        },
        process.env.JWT_KEY as string,
        { expiresIn: "30d" },
      )

      const primeiroAcesso = !usuario.senhaAlterada
      
      const resposta = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        roles: roles,
        token,
        primeiroAcesso,
      }

      res.status(200).json(resposta)

      await prisma.log.create({
        data: {
          descricao: "Login Realizado",
          complemento: `Usuário: ${usuario.email}`,
          usuarioId: usuario.id,
          schoolId: usuario.schoolId!
        },
      })
      return
    }

    res.status(400).json({ erro: msg })
  } catch (error) {
    console.error("Erro no Login:", error)
    res.status(400).json({ erro: "Erro interno no login" })
  }
})

export default router

