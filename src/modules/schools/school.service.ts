import { prisma } from '../../lib/prisma';
import { CreateSchoolInput } from './school.schema';
import { AppError } from '../../shared/errors/AppError';
import { UserService } from '../../../services/userService';
import { TIPO_USUARIO, SubscriptionPlan } from '@prisma/client';

export class SchoolService {

  async createSchool(data: CreateSchoolInput) {
    const existingSchool = await prisma.school.findUnique({
      where: { slug: data.slug }
    });

    if (existingSchool) {
      throw new AppError(`School with slug '${data.slug}' already exists`, 409);
    }
    


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

      const userService = new UserService(school.id, tx);
      const user = await userService.create({
        nome: data.adminUser.nome,
        email: data.adminUser.email,
        telefone: data.adminUser.telefone,
        roles: [TIPO_USUARIO.ADMIN],
        schoolId: school.id
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
