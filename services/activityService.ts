import { prisma } from '../config/prisma'
import { CreateActivityInput } from '../schemas/activity.schema'

export class ActivityService {
  constructor(private schoolId: string) {}

  private normalizeDate(dateStr: string): Date {
      if (dateStr.length === 10) {
          const [ano, mes, dia] = dateStr.split('-').map(Number);
          return new Date(Date.UTC(ano, mes - 1, dia, 3, 0, 0));
      }
      return new Date(dateStr);
  }

  async create(data: CreateActivityInput, professorId: number) {
    const turma = await prisma.turma.findFirst({
        where: { id: data.turmaId, schoolId: this.schoolId }
    })
    if (!turma) throw new Error("Turma não encontrada")

    const objetivo = await prisma.objetivo.findUnique({ where: { id: data.objetivoId } })
    if (!objetivo) throw new Error("Objetivo não encontrado")

    return prisma.atividade.create({
      data: {
        ...data,
        data: this.normalizeDate(data.data),
        professorId,
        schoolId: this.schoolId,
        isAtivo: data.isAtivo !== undefined ? data.isAtivo : true
      },
      include: {
          professor: { select: { id: true, nome: true, email: true } },
          turma: { select: { id: true, nome: true } },
          objetivo: { select: { id: true, codigo: true, descricao: true } }
      }
    })
  }

  async findAll() {
      return prisma.atividade.findMany({
          where: { schoolId: this.schoolId },
          select: {
              id: true,
              ano: true,
              periodo: true,
              quantHora: true,
              data: true,
              campoExperiencia: true,
              turma: { select: { id: true, nome: true } }
          },
          orderBy: { data: 'desc' }
      })
  }

  async findById(id: number) {
      return prisma.atividade.findFirst({
          where: { id, schoolId: this.schoolId },
          include: {
              professor: { select: { id: true, nome: true, email: true, telefone: true } },
              turma: { select: { id: true, nome: true } },
              objetivo: { select: { id: true, codigo: true, descricao: true } }
          }
      })
  }

  async findByProfessor(professorId: number) {
      const vinculos = await prisma.professorTurma.findMany({
          where: { usuarioId: professorId, schoolId: this.schoolId },
          include: { turma: { select: { id: true, nome: true } } }
      })
      
      const turmaIds = vinculos.map(v => v.turmaId)
      if (turmaIds.length === 0) throw new Error("Nenhuma turma relacionada ao professor")
      
      const atividades = await prisma.atividade.findMany({
          where: {
              schoolId: this.schoolId,
              turmaId: { in: turmaIds },
              professorId
          },
          select: {
            id: true,
            ano: true,
            periodo: true,
            quantHora: true,
            data: true,
            campoExperiencia: true,
            turma: { select: { id: true, nome: true } },
            objetivo: { select: { id: true, codigo: true, descricao: true } }
          },
          orderBy: { data: 'desc' }
      })

      return {
          turmas: vinculos.map(v => v.turma),
          atividades
      }
  }

  async getReportByExperienceField() {
      const atividadesPorCampo = await prisma.atividade.groupBy({
          by: ['campoExperiencia'],
          where: { schoolId: this.schoolId },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } }
      })

      const atividadesPorCampoETurma = await prisma.atividade.groupBy({
          by: ['campoExperiencia', 'turmaId'],
          where: { schoolId: this.schoolId },
          _count: { id: true }
      })

      const turmas = await prisma.turma.findMany({
          where: { schoolId: this.schoolId },
          select: { id: true, nome: true }
      })
      const turmasMap = turmas.reduce((acc, t) => ({...acc, [t.id]: t.nome}), {} as Record<number,string>)

      const relatorio = atividadesPorCampo.map(campo => {
          const detalhesPorTurma = atividadesPorCampoETurma
            .filter(item => item.campoExperiencia === campo.campoExperiencia)
            .map(item => ({
                turmaId: item.turmaId,
                turma: turmasMap[item.turmaId] || 'Desconhecida',
                total: item._count.id
            }))
            .sort((a,b) => b.total - a.total)
            
          return {
              campoExperiencia: campo.campoExperiencia,
              totalGeral: campo._count.id,
              detalhesPorTurma
          }
      })

      return {
          resumo: {
              totalAtividades: atividadesPorCampo.reduce((acc, c) => acc + c._count.id, 0),
              totalCampos: atividadesPorCampo.length
          },
          relatorio
      }
  }
}
