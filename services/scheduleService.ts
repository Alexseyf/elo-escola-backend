import { prisma } from '../config/prisma'
import { CreateScheduleInput, UpdateScheduleInput } from '../schemas/schedule.schema'
import normalizarData from '../utils/normalizaData'

export class ScheduleService {
  constructor(private schoolId: string) {}

  private normalizeDate(dateStr: string): Date {
    const dataFormatada = normalizarData(dateStr);
    return new Date(dataFormatada);
  }

  async create(data: CreateScheduleInput, criadorId: number) {
      return prisma.cronograma.create({
          data: {
              ...data,
              data: this.normalizeDate(data.data),
              criadorId,
              schoolId: this.schoolId
          }
      })
  }

  async findAll(filters: { data?: string, tipoEvento?: any, isAtivo?: boolean }) {
      const where: any = { schoolId: this.schoolId }
      if (filters.data) where.data = this.normalizeDate(filters.data)
      if (filters.tipoEvento) where.tipoEvento = filters.tipoEvento
      if (filters.isAtivo !== undefined) where.isAtivo = filters.isAtivo

      return prisma.cronograma.findMany({
          where,
          include: {
              criador: { select: { id: true, nome: true, email: true } }
          },
          orderBy: { data: 'asc' }
      })
  }

  async findById(id: number) {
      return prisma.cronograma.findFirst({
          where: { id, schoolId: this.schoolId },
          include: {
            criador: { select: { id: true, nome: true, email: true } }
          }
      })
  }

  async update(id: number, data: UpdateScheduleInput) {
      const schedule = await this.findById(id)
      if (!schedule) throw new Error("Cronograma não encontrado")

      const updateData: any = { ...data }
      if (data.data) updateData.data = this.normalizeDate(data.data)

      return prisma.cronograma.update({
          where: { id },
          data: updateData
      })
  }

  async delete(id: number) {
      const schedule = await this.findById(id)
      if (!schedule) throw new Error("Cronograma não encontrado")

      return prisma.cronograma.update({
          where: { id },
          data: { isAtivo: false }
      })
  }
}
