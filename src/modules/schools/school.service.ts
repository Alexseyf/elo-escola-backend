import { prisma } from '../../lib/prisma';
import { CreateSchoolInput } from './school.schema';
import { AppError } from '../../shared/errors/AppError';
import bcrypt from 'bcrypt';
import { TIPO_USUARIO, SubscriptionPlan } from '@prisma/client';

export class SchoolService {

  async createSchool(data: CreateSchoolInput) {
    const existingSchool = await prisma.school.findUnique({
      where: { slug: data.slug }
    });

    if (existingSchool) {
      throw new AppError(`School with slug '${data.slug}' already exists`, 409);
    }
    
    const hashedPassword = await bcrypt.hash(data.adminUser.senha, 10);

    return prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: data.name,
          slug: data.slug,
          active: true,
          legalName: data.legalName,
          cnpj: data.cnpj,
          logoUrl: data.logoUrl,
          primaryColor: data.primaryColor,
          timezone: data.timezone,
          subscriptionPlan: data.subscriptionPlan as SubscriptionPlan
        }
      });

      const adminRole = await tx.role.upsert({
        where: { tipo: TIPO_USUARIO.ADMIN },
        update: {},
        create: { tipo: TIPO_USUARIO.ADMIN }
      });

      const user = await tx.usuario.create({
        data: {
          nome: data.adminUser.nome,
          email: data.adminUser.email,
          senha: hashedPassword,
          telefone: '',
          schoolId: school.id,
          isAtivo: true,
          roles: {
            create: {
              roleId: adminRole.id
            }
          }
        }
      });

      return {
        school,
        admin: {
          id: user.id,
          nome: user.nome,
          email: user.email
        }
      };
    });
  }
}
