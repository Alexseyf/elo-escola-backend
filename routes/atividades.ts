import { Router } from "express"
import { TIPO_USUARIO } from "@prisma/client"
import { checkToken } from "../src/shared/middlewares/checkToken"
import { checkRoles } from "../src/shared/middlewares/checkRoles"
import { createActivitySchema } from "../schemas/activity.schema"
import { ActivityService } from "../services/activityService"

const router = Router()

// Cria uma nova atividade
router.post("/", checkToken, checkRoles([TIPO_USUARIO.PROFESSOR]), async (req, res) => {
  try {
    const schoolId = req.schoolId
    const professorId = req.userLogadoId

    if (!schoolId) return res.status(400).json({ erro: "Contexto da escola não identificado" })
    if (!professorId) return res.status(401).json({ erro: "Usuário não identificado" })

    const valida = createActivitySchema.safeParse(req.body)
    if (!valida.success) {
      return res.status(400).json({ erro: "Dados inválidos", detalhes: valida.error })
    }

    const service = new ActivityService(schoolId)
    const atividade = await service.create(valida.data, professorId)

    return res.status(201).json({
      mensagem: "Atividade cadastrada com sucesso",
      atividade
    })
  } catch (error: any) {
    console.error("Erro ao cadastrar atividade:", error)
    return res.status(500).json({
      erro: "Erro ao cadastrar atividade",
      detalhes: error.message || "Erro desconhecido"
    })
  }
})

// Lista todas as atividades (Admin)
router.get("/", checkToken, checkRoles([TIPO_USUARIO.ADMIN]), async (req, res) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

    const service = new ActivityService(schoolId)
    const result = await service.findAll()

    return res.status(200).json({
      total: result.length,
      atividades: result
    })
  } catch (error: any) {
    console.error("Erro ao listar atividades:", error)
    return res.status(500).json({ erro: "Erro ao listar atividades", detalhes: error.message })
  }
})

// Gera um relatório com a contagem de atividades por campo de experiência
router.get("/relatorio/campo-experiencia", checkToken, checkRoles([TIPO_USUARIO.ADMIN]), async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const service = new ActivityService(schoolId)
        const report = await service.getReportByExperienceField()

        return res.status(200).json(report)
    } catch (error: any) {
        return res.status(500).json({ erro: "Erro ao gerar relatório", detalhes: error.message })
    }
})

// Busca uma atividade por ID
router.get("/:id", checkToken, checkRoles([TIPO_USUARIO.ADMIN, TIPO_USUARIO.PROFESSOR]), async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ erro: "ID inválido" })

        const service = new ActivityService(schoolId)
        const atividade = await service.findById(id)

        if (!atividade) return res.status(404).json({ erro: "Atividade não encontrada" })

        return res.status(200).json(atividade)
    } catch (error: any) {
        return res.status(500).json({ erro: "Erro ao buscar atividade", detalhes: error.message })
    }
})

// Lista as atividades de um professor
router.get("/turma-atividades/:professorId", checkToken, checkRoles([TIPO_USUARIO.PROFESSOR]), async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const professorId = parseInt(req.params.professorId)
        if (isNaN(professorId)) return res.status(400).json({ erro: "ID de professor inválido" })

        const service = new ActivityService(schoolId)
        const result = await service.findByProfessor(professorId)

        return res.status(200).json(result)
    } catch (error: any) {
        return res.status(500).json({ erro: "Erro ao buscar atividades", detalhes: error.message })
    }
})

export default router

