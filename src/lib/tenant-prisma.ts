import { PrismaClient, Prisma } from '@prisma/client';

const TENANT_MODELS = [
  'usuario',
  'turma',
  'aluno',
  'diario',
  'cronograma',
  'evento',
  'atividade',
  'log',
  'periodoSono',
  'diarioItemProvidencia',
  'professorTurma',
  'responsavelAluno',
] as const;

type TenantModelName = (typeof TENANT_MODELS)[number];

const OPERATIONS_WITH_WHERE = [
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'update',
  'updateMany',
  'upsert',
  'delete',
  'deleteMany',
  'count',
  'aggregate',
  'groupBy',
] as const;

type OperationWithWhere = (typeof OPERATIONS_WITH_WHERE)[number];

interface TenantPrismaOptions {
  schoolId: string;

  isPlatformAdmin?: boolean;

  enableQueryLog?: boolean;
}

export function createTenantPrismaClient(options: TenantPrismaOptions) {
  const { schoolId, isPlatformAdmin = false, enableQueryLog = false } = options;

  if (!schoolId || schoolId.trim() === '') {
    throw new Error(
      '[SECURITY] schoolId é obrigatório para criar Prisma Client com tenant isolation'
    );
  }

  const basePrisma = new PrismaClient({
    log: enableQueryLog ? ['query', 'error', 'warn'] : ['error'],
  });
  let extendedPrisma = basePrisma as any;

  for (const modelName of TENANT_MODELS) {
    extendedPrisma = extendedPrisma.$extends({
      name: `tenant-isolation-${modelName}`,
      query: {
        [modelName]: {
          async $allOperations({ operation, args, query }: any) {

            if (isPlatformAdmin) {
              return query(args);
            }

            if (OPERATIONS_WITH_WHERE.includes(operation as OperationWithWhere)) {
              if (!args.where) {
                args.where = {};
              }

              if (args.where.schoolId && args.where.schoolId !== schoolId) {
                throw new Error(
                  `[SECURITY] Tentativa de cross-tenant access detectada!\n` +
                    `Modelo: ${modelName}\n` +
                    `Operação: ${operation}\n` +
                    `Tenant Contexto: ${schoolId}\n` +
                    `Tenant Tentado: ${args.where.schoolId}\n` +
                    `Esta ação foi registrada e será auditada.`
                );
              }

              args.where.schoolId = schoolId;
            }
            if (operation === 'create') {
              if (!args.data) {
                args.data = {};
              }

              if (args.data.schoolId && args.data.schoolId !== schoolId) {
                throw new Error(
                  `[SECURITY] Tentativa de criar recurso em outro tenant!\n` +
                    `Modelo: ${modelName}\n` +
                    `Tenant Contexto: ${schoolId}\n` +
                    `Tenant Tentado: ${args.data.schoolId}`
                );
              }

              args.data.schoolId = schoolId;
            }

            if (operation === 'createMany') {
              if (Array.isArray(args.data)) {
                args.data = args.data.map((item: any) => {
                  if (item.schoolId && item.schoolId !== schoolId) {
                    throw new Error(
                      `[SECURITY] Tentativa de createMany com schoolId diferente!\n` +
                        `Modelo: ${modelName}\n` +
                        `Tenant Contexto: ${schoolId}\n` +
                        `Tenant Tentado: ${item.schoolId}`
                    );
                  }

                  return {
                    ...item,
                    schoolId,
                  };
                });
              }
            }

            if (operation === 'upsert') {
              if (!args.where) args.where = {};
              if (args.where.schoolId && args.where.schoolId !== schoolId) {
                throw new Error(`[SECURITY] Cross-tenant upsert WHERE bloqueado`);
              }
              args.where.schoolId = schoolId;

              if (args.create) {
                if (args.create.schoolId && args.create.schoolId !== schoolId) {
                  throw new Error(`[SECURITY] Cross-tenant upsert CREATE bloqueado`);
                }
                args.create.schoolId = schoolId;
              }

              if (args.update?.schoolId && args.update.schoolId !== schoolId) {
                throw new Error(
                  `[SECURITY] Tentativa de mudar schoolId via UPDATE bloqueada`
                );
              }
            }

            return query(args);
          },
        },
      },
    });
  }

  return extendedPrisma as PrismaClient;
}

export const globalPrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export function isPlatformAdminRole(roles: string[]): boolean {
  return roles.includes('PLATFORM_ADMIN');
}
