import { prisma } from '../../lib/prisma';
import { CreateStudentInput, UpdateStudentInput } from './student.schema';
import { AppError } from '../../shared/errors/AppError';

export class StudentService {
  constructor(private schoolId: string) {}

  async create(data: CreateStudentInput) {
    const turma = await prisma.turma.findUnique({
      where: { id: data.turmaId }
    });

    if (!turma || turma.schoolId !== this.schoolId) {
      throw new AppError("Turma inválida ou não pertencente a esta escola");
    }

    return prisma.aluno.create({
      data: {
        nome: data.nome,
        dataNasc: typeof data.dataNasc === 'string' ? new Date(data.dataNasc) : data.dataNasc,
        turmaId: data.turmaId,
        isAtivo: data.isAtivo ?? true,
        mensalidade: data.mensalidade,
        schoolId: this.schoolId
      }
    });
  }

  async findAll(onlyActive: boolean = false) {
    return prisma.aluno.findMany({
      where: {
        schoolId: this.schoolId,
        ...(onlyActive ? { isAtivo: true } : {})
      },
      include: {
        turma: true,
        responsaveis: {
          include: {
            usuario: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    });
  }

  async findById(id: number) {
    return prisma.aluno.findFirst({
      where: {
        id,
        schoolId: this.schoolId
      },
      include: {
        turma: true,
        responsaveis: {
          include: {
            usuario: true
          }
        },
        diario: {
          orderBy: {
            data: 'desc'
          },
          take: 10,
          include: {
            periodosSono: true,
            itensProvidencia: {
              include: {
                itemProvidencia: true
              }
            }
          }
        }
      }
    });
  }

  async update(id: number, data: UpdateStudentInput) {
    const exists = await this.findById(id);
    if (!exists) throw new AppError("Aluno não encontrado", 404);

    if (data.turmaId) {
      const turma = await prisma.turma.findUnique({ where: { id: data.turmaId }});
      if (!turma || turma.schoolId !== this.schoolId) {
        throw new AppError("Turma inválida");
      }
    }

    const updateData: any = { ...data };
    if (data.dataNasc && typeof data.dataNasc === 'string') {
        updateData.dataNasc = new Date(data.dataNasc);
    }

    return prisma.aluno.update({
      where: { id },
      data: updateData
    });
  }

  async softDelete(id: number) {
    const exists = await this.findById(id);
    if (!exists) throw new AppError("Aluno não encontrado", 404);

    return prisma.aluno.update({
      where: { id },
      data: { isAtivo: false }
    });
  }
}
