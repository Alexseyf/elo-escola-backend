import { Router } from "express"
import { checkToken } from '../src/shared/middlewares/checkToken'
import { checkRoles } from "../src/shared/middlewares/checkRoles"
import { createClassSchema, assignTeacherSchema } from "../schemas/class.schema"
import { ClassService } from "../services/classService"

const router = Router()

// Cria uma turma
router.post("/", checkToken, checkRoles(["ADMIN"]), async (req, res) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

    const valida = createClassSchema.safeParse(req.body)
    if (!valida.success) {
      return res.status(400).json({ erro: "Nome de turma inválido", details: valida.error })
    }

    const service = new ClassService(schoolId)
    const turma = await service.create(valida.data)
    
    res.status(201).json(turma)

  } catch (error: any) {
    if (error.message.includes('Grupo')) {
        res.status(400).json({ erro: "Erro de Configuração", details: error.message })
    } else {
        res.status(400).json({ erro: "Erro ao criar turma", details: error.message })
    }
  }
})

// Lista todas as turmas
router.get("/", checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const service = new ClassService(schoolId)
        const turmas = await service.findAll()

        res.status(200).json(turmas)
    } catch (error: any) {
        res.status(400).json({ erro: error.message })
    }
})

// Adiciona um professor a uma turma
router.post("/:usuarioId/professor", checkToken, checkRoles(["ADMIN"]), async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const usuarioId = parseInt(req.params.usuarioId)
        if (isNaN(usuarioId)) return res.status(400).json({ erro: "ID de usuário inválido" })

        const valida = assignTeacherSchema.safeParse(req.body)
        if (!valida.success) return res.status(400).json({ erro: "Dados inválidos", details: valida.error })

        const service = new ClassService(schoolId)
        const relation = await service.addProfessor(valida.data.turmaId, usuarioId)

        res.status(201).json(relation)
    } catch (error: any) {
        res.status(400).json({ erro: error.message })
    }
})

// Busca todos os alunos de uma turma
router.get("/:turmaId/alunos", checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const turmaId = parseInt(req.params.turmaId)
        if (isNaN(turmaId)) return res.status(400).json({ erro: "ID inválido" })

        const service = new ClassService(schoolId)
        const turma = await service.findById(turmaId)

        if (!turma) return res.status(404).json({ erro: "Turma não encontrada" })

        res.status(200).json(turma.alunos)
    } catch (error: any) {
        res.status(400).json({ erro: error.message })
    }
})

// Busca o total de alunos ativos
router.get("/totalAlunosTurma", checkToken, checkRoles(["ADMIN"]), async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const service = new ClassService(schoolId)
        const result = await service.getTotalActiveStudents()

        res.status(200).json(result)
    } catch (error: any) {
        res.status(400).json({ erro: error.message })
    }
})

export default router
