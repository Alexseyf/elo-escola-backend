import { prisma } from '../config/prisma'

export class ResponsavelService {
  constructor(private schoolId: string) {}

  async getAlunosByResponsavel(responsavelId: number) {
      const usuario = await prisma.usuario.findUnique({
          where: { 
              id: responsavelId,
          },
          include: { roles: { include: { role: true } } }
      })
      
      if (!usuario) throw new Error("Responsável não encontrado")
      if (usuario.schoolId !== this.schoolId) throw new Error("Responsável não pertence a esta escola")
      
      const isResponsavel = usuario.roles.some(ur => ur.role.tipo === "RESPONSAVEL")
      if (!isResponsavel) throw new Error("Usuário não é um responsável")

      const vinculos = await prisma.responsavelAluno.findMany({
          where: { usuarioId: responsavelId },
          include: {
              aluno: {
                  include: { turma: true }
              }
          }
      })

      return vinculos
          .map(v => v.aluno)
          .filter(a => a.schoolId === this.schoolId) 
  }
}
