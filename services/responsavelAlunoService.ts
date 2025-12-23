import { prisma } from '../config/prisma';

export class ResponsavelAlunoService {
  constructor(private schoolId: string) {}

  async checkAccess(usuarioId: number, alunoId: number): Promise<boolean> {
    const relation = await prisma.responsavelAluno.findFirst({
      where: {
        usuarioId,
        alunoId,
        schoolId: this.schoolId
      }
    });
    
    return !!relation;
  }

  async findRelation(usuarioId: number, alunoId: number) {
    return prisma.responsavelAluno.findFirst({
      where: {
        usuarioId,
        alunoId,
        schoolId: this.schoolId
      },
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            turmaId: true
          }
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true
          }
        }
      }
    });
  }

  async findAlunosByResponsavel(usuarioId: number) {
    const relations = await prisma.responsavelAluno.findMany({
      where: {
        usuarioId,
        schoolId: this.schoolId
      },
      include: {
        aluno: {
          include: {
            turma: true
          }
        }
      }
    });

    return relations.map(r => r.aluno);
  }

  async findResponsaveisByAluno(alunoId: number) {
    const relations = await prisma.responsavelAluno.findMany({
      where: {
        alunoId,
        schoolId: this.schoolId
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            isAtivo: true
          }
        }
      }
    });

    return relations.map(r => r.usuario);
  }

  async create(usuarioId: number, alunoId: number) {
    const [usuario, aluno] = await Promise.all([
      prisma.usuario.findFirst({ where: { id: usuarioId, schoolId: this.schoolId } }),
      prisma.aluno.findFirst({ where: { id: alunoId, schoolId: this.schoolId } })
    ]);

    if (!usuario) {
      throw new Error('Responsável não encontrado nesta escola');
    }

    if (!aluno) {
      throw new Error('Aluno não encontrado nesta escola');
    }

    return prisma.responsavelAluno.create({
      data: {
        usuarioId,
        alunoId,
        schoolId: this.schoolId
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        aluno: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });
  }

  async remove(usuarioId: number, alunoId: number) {
    const relation = await this.findRelation(usuarioId, alunoId);

    if (!relation) {
      throw new Error('Relação não encontrada nesta escola');
    }

    return prisma.responsavelAluno.delete({
      where: {
        id: relation.id
      }
    });
  }
}
