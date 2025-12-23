import { createTenantPrismaClient, isPlatformAdminRole } from '../src/lib/tenant-prisma';
import { CreateUserInput } from '../schemas/user.schema';
import bcrypt from 'bcrypt';
import { generateDefaultPassword } from '../utils/passwordUtils';
import { enviarEmailSenhaPadrao } from '../utils/emailService';

export class UserService {
  private prisma: ReturnType<typeof createTenantPrismaClient>;

  constructor(
    private schoolId: string,
    private roles: string[] = []
  ) {
    this.prisma = createTenantPrismaClient({
      schoolId: this.schoolId,
      isPlatformAdmin: isPlatformAdminRole(this.roles),
      enableQueryLog: process.env.NODE_ENV === 'development'
    });
  }

  async create(data: CreateUserInput) {
    const existingUser = await this.prisma.usuario.findUnique({
      where: {
        email_schoolId: {
          email: data.email,
          schoolId: this.schoolId
        }
      }
    });

    if (existingUser) {
      throw new Error('Email already registered for this school.');
    }

    const passwordRaw = data.senha || generateDefaultPassword(data.email);
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(passwordRaw, salt);

    const newUser = await this.prisma.usuario.create({
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
    });

    if (!data.senha) {
      await enviarEmailSenhaPadrao(newUser.email, newUser.nome, passwordRaw);
    }

    const { senha, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      include: {
        roles: {
          include: { role: true }
        }
      }
    });
  }

  async findById(userId: number) {
    return this.prisma.usuario.findFirst({
      where: { id: userId },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
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
    });
  }

  async update(userId: number, data: Partial<CreateUserInput>) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found in this school');
    }

    const updateData: any = {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
    };

    if (data.senha) {
      const salt = bcrypt.genSaltSync(12);
      updateData.senha = bcrypt.hashSync(data.senha, salt);
      updateData.senhaAlterada = true;
    }

    return this.prisma.usuario.update({
      where: { id: userId },
      data: updateData,
      include: {
        roles: {
          include: { role: true }
        }
      }
    });
  }

  async delete(userId: number) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found in this school');
    }
    return this.prisma.usuario.delete({
      where: { id: userId }
    });
  }

  async deactivate(userId: number) {
    return this.update(userId, { isAtivo: false } as any);
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}
