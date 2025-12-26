import { prisma } from '../config/prisma'
import { CreateUserInput } from '../schemas/user.schema'
import bcrypt from 'bcrypt'
import { generateDefaultPassword } from '../utils/passwordUtils'
import { enviarEmailSenhaPadrao } from '../utils/emailService'

import { PrismaClient, Prisma } from '@prisma/client'

export class UserService {
  constructor(private schoolId: string, private db: PrismaClient | Prisma.TransactionClient = prisma) {}

  async create(data: CreateUserInput) {
    const existingUser = await this.db.usuario.findUnique({
      where: {
        email_schoolId: {
          email: data.email,
          schoolId: this.schoolId
        }
      }
    })

    if (existingUser) {
      throw new Error('Email already registered for this school.')
    }

    const passwordRaw = data.senha || generateDefaultPassword(data.email)
    const salt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync(passwordRaw, salt)

    const newUser = await this.db.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: hash,
        telefone: data.telefone,
        senhaAlterada: !!data.senha,
        schoolId: this.schoolId,
        roles: {
          create: data.roles.map(role => ({
            role: {
              connectOrCreate: {
                where: { tipo: role },
                create: { tipo: role }
              }
            }
          }))
        }
      }
    })

    if (!data.senha) {
      await enviarEmailSenhaPadrao(newUser.email, newUser.nome, passwordRaw);
    }

    const { senha, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  async findAll() {
    return this.db.usuario.findMany({
      where: { schoolId: this.schoolId },
      include: {
        roles: {
          include: { role: true }
        }
      }
    })
  }
  
  async findById(userId: number) {
    return this.db.usuario.findFirst({
      where: { 
        id: userId,
        schoolId: this.schoolId 
      },
      include: {
        roles: {
          include: { role: true }
        }
      }
    })
  }

  async findByEmail(email: string) {
    return this.db.usuario.findUnique({
      where: {
        email_schoolId: {
            email,
            schoolId: this.schoolId
        }
      },
      include: {
        roles: {
          include: { role: true }
        }
      }
    })
  }
}
