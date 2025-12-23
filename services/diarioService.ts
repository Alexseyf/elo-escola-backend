import { prisma } from '../config/prisma'
import { CreateDiarioInput } from '../schemas/diario.schema'
import normalizarData from '../utils/normalizaData'
// ✅ P2.2 - Import TenantLogger
import { createTenantLogger, TenantLogger } from '../src/lib/logger'

export class DiarioService {
  private logger: TenantLogger;
  
  constructor(private schoolId: string) {
    this.logger = createTenantLogger(schoolId);
  }

  private normalizeDate(dateStr: string): string {
    return normalizarData(dateStr);
  }

  private stringDateToDbDate(dateStr: string): Date {
      const normalized = this.normalizeDate(dateStr);
      const [ano, mes, dia] = normalized.split('-').map(Number);
      return new Date(ano, mes - 1, dia, 12, 0, 0);
  }

  async create(data: CreateDiarioInput) {
      this.logger.info('Criando diário', { alunoId: data.alunoId, data: data.data });
      
      const dataFormatada = this.normalizeDate(data.data);
      
      const aluno = await prisma.aluno.findUnique({
          where: { id: data.alunoId }
      })
      if (!aluno) throw new Error("Aluno não encontrado")
      if (aluno.schoolId !== this.schoolId) throw new Error("Aluno não pertence a esta escola")

      const dbDate = this.stringDateToDbDate(data.data);
      
      const existing = await prisma.diario.findFirst({
        where: {
            schoolId: this.schoolId,
            alunoId: data.alunoId,
            data: dbDate
        }
      })
      if (existing) throw new Error("Já existe um diário para este aluno nesta data")

      const { periodosSono, itensProvidencia, ...diarioData } = data
      let itensProvidenciaIds: { id: number }[] = [];
      
      if (itensProvidencia && itensProvidencia.length > 0) {
          const itensEncontrados = await prisma.itemProvidencia.findMany({
              where: { nome: { in: itensProvidencia } },
              select: { id: true }
          })
          itensProvidenciaIds = itensEncontrados;
      }

      const diario = await prisma.diario.create({
          data: {
              ...diarioData,
              data: dbDate,
              schoolId: this.schoolId,
              periodosSono: periodosSono ? {
                  create: periodosSono.map(periodo => ({
                      ...periodo,
                      schoolId: this.schoolId
                  }))
              } : undefined,
              itensProvidencia: itensProvidenciaIds.length > 0 ? {
                  create: itensProvidenciaIds.map(item => ({
                      itemProvidenciaId: item.id,
                      schoolId: this.schoolId
                  }))
              } : undefined
          },
          include: {
              aluno: true,
              periodosSono: true,
              itensProvidencia: { include: { itemProvidencia: true } }
          }
      });
      
      this.logger.info('Diário criado com sucesso', { diarioId: diario.id, alunoId: diario.alunoId });
      return diario;
  }

  async findAllByAluno(alunoId: number) {
      const aluno = await prisma.aluno.findUnique({ where: { id: alunoId, schoolId: this.schoolId } })
      if (!aluno) throw new Error("Aluno não encontrado")

      return prisma.diario.findMany({
          where: { alunoId, schoolId: this.schoolId }, 
          orderBy: { data: 'desc' },
          include: {
              aluno: true,
              periodosSono: true,
              itensProvidencia: { include: { itemProvidencia: true } }
          }
      })
  }

  async findById(id: number) {
      return prisma.diario.findFirst({
          where: { id, schoolId: this.schoolId },
          include: {
              aluno: true,
              periodosSono: true,
              itensProvidencia: { include: { itemProvidencia: true } }
          }
      })
  }

  async update(id: number, data: CreateDiarioInput) {
      return await prisma.$transaction(async (tx) => {
          const diario = await tx.diario.findFirst({
              where: { id, schoolId: this.schoolId }
          });
          
          if (!diario) {
              throw new Error("Diário não encontrado");
          }

          const { periodosSono, itensProvidencia, ...diarioData } = data;
          const dbDate = this.stringDateToDbDate(data.data);

          let itensProvidenciaIds: { id: number }[] = [];
          if (itensProvidencia && itensProvidencia.length > 0) {
              const itensEncontrados = await tx.itemProvidencia.findMany({
                  where: { nome: { in: itensProvidencia } },
                  select: { id: true }
              });
              itensProvidenciaIds = itensEncontrados;
          }

          await tx.periodoSono.deleteMany({ 
              where: { diarioId: id, schoolId: this.schoolId } 
          });
          
          await tx.diarioItemProvidencia.deleteMany({ 
              where: { diarioId: id, schoolId: this.schoolId } 
          });

          const updated = await tx.diario.update({
              where: { id },
              data: {
                  ...diarioData,
                  data: dbDate,
                  periodosSono: periodosSono ? {
                      create: periodosSono.map(periodo => ({
                          ...periodo,
                          schoolId: this.schoolId
                      }))
                  } : undefined,
                  itensProvidencia: itensProvidenciaIds.length > 0 ? {
                      create: itensProvidenciaIds.map(item => ({
                          itemProvidenciaId: item.id,
                          schoolId: this.schoolId
                      }))
                  } : undefined
              },
              include: {
                  aluno: true,
                  periodosSono: true,
                  itensProvidencia: { include: { itemProvidencia: true } }
              }
          });

          return updated;
      });
  }
}
