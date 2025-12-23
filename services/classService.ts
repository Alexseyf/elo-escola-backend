import { prisma } from '../config/prisma'
import { TURMA, GRUPO_POR_CAMPO } from '@prisma/client'
import { CreateClassInput } from '../schemas/class.schema'

export class ClassService {
  constructor(private schoolId: string) {}

  private async getGroupByName(groupName: GRUPO_POR_CAMPO) {
    const grupo = await prisma.grupoPorCampo.findUnique({
      where: { nome: groupName }
    })
    
    if (!grupo) throw new Error(`Grupo ${groupName} não encontrado`)
    return grupo.id
  }

  private mapClassToGroup(turma: TURMA): GRUPO_POR_CAMPO {
      switch (turma) {
          case "BERCARIO2":
              return "BEBES";
          case "MATERNAL1":
          case "MATERNAL2":
              return "CRIANCAS_BEM_PEQUENAS";
          case "PRE1":
          case "PRE2":
              return "CRIANCAS_PEQUENAS";
          case "TURNOINVERSO":
              return "CRIANCAS_MAIORES";
          default:
              throw new Error("Turma desconhecida mapeamento de grupo")
      }
  }

  async create(data: CreateClassInput) {
    const existing = await prisma.turma.findFirst({
        where: {
            nome: data.nome,
            schoolId: this.schoolId
        }
    })

    if (existing) {
        throw new Error("Turma já existente")
    }

    const groupName = this.mapClassToGroup(data.nome)
    const grupoId = await this.getGroupByName(groupName)

    return prisma.turma.create({
      data: {
        nome: data.nome,
        grupoId: grupoId,
        schoolId: this.schoolId
      }
    })
  }

  async findAll() {
      return prisma.turma.findMany({
          where: { schoolId: this.schoolId },
          include: {
              professores: {
                  include: {
                      usuario: true
                  }
              },
              alunos: true
          }
      })
  }

  async findById(id: number) {
      return prisma.turma.findFirst({
          where: {
              id,
              schoolId: this.schoolId
          },
          include: {
              alunos: {
                  include: {
                      responsaveis: {
                          include: { usuario: true }
                      }
                  }
              }
          }
      })
  }

  async getTotalActiveStudents() {
      const turmas = await prisma.turma.findMany({
          where: { schoolId: this.schoolId },
          include: {
              _count: {
                  select: {
                      alunos: {
                          where: { isAtivo: true }
                      }
                  }
              }
          }
      })

      return turmas.map(t => ({
          id: t.id,
          nome: t.nome,
          totalAlunosAtivos: t._count.alunos
      }))
  }

  async addProfessor(turmaId: number, usuarioId: number) {
      const turma = await this.findById(turmaId)
      if (!turma) throw new Error("Turma não encontrada")
      
      const usuario = await prisma.usuario.findFirst({
          where: { id: usuarioId, schoolId: this.schoolId },
          include: { roles: { include: { role: true } } }
      })
      if (!usuario) throw new Error("Usuário não encontrado")
          
      const isProfessor = usuario.roles.some(ur => ur.role.tipo === "PROFESSOR")
      if (!isProfessor) throw new Error("O usuário deve ser um PROFESSOR")

      return prisma.professorTurma.create({
          data: {
              turmaId,
              usuarioId,
              schoolId: this.schoolId
          }
      })
  }
}
