import { prisma } from '../config/prisma'
import { CreateEventInput, UpdateEventInput } from '../schemas/event.schema'
import normalizarData from '../utils/normalizaData'

export class EventService {
  constructor(private schoolId: string) {}

  private normalizeDate(dateStr: string): Date {
      const dataFormatada = normalizarData(dateStr);
      return new Date(dataFormatada);
  }

  async create(data: CreateEventInput, criadorId: number) {
    const turma = await prisma.turma.findFirst({
        where: { id: data.turmaId, schoolId: this.schoolId }
    })
    if (!turma) throw new Error("Turma não encontrada ou não pertence a esta escola")

    return prisma.evento.create({
      data: {
        ...data,
        data: this.normalizeDate(data.data),
        criadorId,
        schoolId: this.schoolId
      }
    })
  }

  async findAll(filters: { data?: string, tipoEvento?: any, turmaId?: number, isAtivo?: boolean }) {
      const where: any = { schoolId: this.schoolId }

      if (filters.data) where.data = this.normalizeDate(filters.data)
      if (filters.tipoEvento) where.tipoEvento = filters.tipoEvento
      if (filters.turmaId) where.turmaId = filters.turmaId
      if (filters.isAtivo !== undefined) where.isAtivo = filters.isAtivo

      return prisma.evento.findMany({
          where,
          include: {
              turma: true,
              criador: {
                  select: { id: true, nome: true, email: true }
              }
          },
          orderBy: { data: 'asc' }
      })
  }

  async findById(id: number) {
      return prisma.evento.findFirst({
          where: { id, schoolId: this.schoolId },
          include: {
              turma: true,
              criador: { select: { id: true, nome: true, email: true } }
          }
      })
  }

  async update(id: number, data: UpdateEventInput) {
      const event = await this.findById(id)
      if (!event) throw new Error("Evento não encontrado")

      if (data.turmaId) {
          const turma = await prisma.turma.findFirst({
              where: { id: data.turmaId, schoolId: this.schoolId }
          })
          if (!turma) throw new Error("Turma não encontrada")
      }

      const updateData: any = { ...data }
      if (data.data) updateData.data = this.normalizeDate(data.data)

      return prisma.evento.update({
          where: { id },
          data: updateData
      })
  }

  async delete(id: number) {
      const event = await this.findById(id)
      if (!event) throw new Error("Evento não encontrado")

      return prisma.evento.update({
          where: { id },
          data: { isAtivo: false }
      })
  }

  async findByTurma(turmaId: number) {
      const turma = await prisma.turma.findFirst({where: { id: turmaId, schoolId: this.schoolId }})
      if (!turma) throw new Error("Turma não encontrada")

      return prisma.evento.findMany({
          where: {
              turmaId,
              schoolId: this.schoolId,
              isAtivo: true
          },
          include: {
              criador: { select: { id: true, nome: true, email: true } }
          },
          orderBy: { data: 'asc' }
      })
  }
}
