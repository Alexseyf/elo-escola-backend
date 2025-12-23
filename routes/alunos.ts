import { Router } from "express"
import { TIPO_USUARIO } from "@prisma/client"
import { checkToken } from '../src/shared/middlewares/checkToken'
import { checkRoles } from "../src/shared/middlewares/checkRoles"
import { StudentService } from "../services/studentService"
import { createStudentSchema, updateStudentSchema } from "../schemas/student.schema"
import normalizarData from "../utils/normalizaData"
import { prisma } from "../config/prisma"

const router = Router()

// Cria estudante
router.post("/", checkToken, checkRoles([TIPO_USUARIO.ADMIN]), async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const valida = createStudentSchema.safeParse(req.body)
        if (!valida.success) return res.status(400).json({ erro: valida.error })

        const service = new StudentService(schoolId)
        const aluno = await service.create(valida.data)
        
        res.status(201).json(aluno)
    } catch (error: any) {
        console.error("Erro ao criar aluno:", error)
        res.status(400).json({ erro: error.message })
    }
})

// Lista todos os estudantes
router.get("/", checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const service = new StudentService(schoolId)
        const alunos = await service.findAll()
        
        res.status(200).json(alunos)
    } catch (error) {
        res.status(500).json(error)
    }
})

// Lista todos os estudantes ativos
router.get("/ativos", checkToken, checkRoles([TIPO_USUARIO.ADMIN]), async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const service = new StudentService(schoolId)
        const alunos = await service.findAll(true)
        
        res.status(200).json(alunos)
    } catch (error) {
        res.status(500).json(error)
    }
})

// Busca estudante por ID
router.get("/:id", checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ erro: "ID inválido" })

        const service = new StudentService(schoolId)
        const aluno = await service.findById(id)

        if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado" })

        res.status(200).json(aluno)
    } catch (error) {
         res.status(500).json({ erro: "Erro ao buscar aluno" })
    }
})

// Altera estudante (priorizar uso do patch)
router.put("/:id", checkToken, checkRoles([TIPO_USUARIO.ADMIN]), async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ erro: "ID inválido" })

        const valida = createStudentSchema.partial().safeParse(req.body)
        const validaPut = createStudentSchema.safeParse(req.body)
        if (!validaPut.success) return res.status(400).json({ erro: validaPut.error })

        const service = new StudentService(schoolId)
        const aluno = await service.update(id, validaPut.data)

        res.status(200).json(aluno)
    } catch (error: any) {
        res.status(400).json({ erro: error.message })
    }
})

// Altera estudante (PATCH - parcial)
router.patch("/:id", checkToken, checkRoles([TIPO_USUARIO.ADMIN]), async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ erro: "ID inválido" })

        const valida = updateStudentSchema.safeParse(req.body)
        if (!valida.success) return res.status(400).json({ erro: valida.error })

        const service = new StudentService(schoolId)
        const aluno = await service.update(id, valida.data)

        res.status(200).json(aluno)
    } catch (error: any) {
        res.status(400).json({ erro: error.message })
    }
})

// Delete (Soft) Estudante
router.delete("/soft/:id", checkToken, checkRoles([TIPO_USUARIO.ADMIN]), async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const id = parseInt(req.params.id)

        const service = new StudentService(schoolId)
        await service.softDelete(id)

        res.status(200).json({ mensagem: "Aluno desativado com sucesso" })
    } catch (error: any) {
         res.status(500).json({ erro: error.message })
    }
})

// Adiciona Responsável
router.post("/:usuarioId/responsavel", checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const usuarioId = parseInt(req.params.usuarioId)
        const { alunoId } = req.body

        if (!alunoId) return res.status(400).json({ erro: "ID do aluno é obrigatório" })

        const service = new StudentService(schoolId)
        const relacao = await service.addResponsavel(alunoId, usuarioId)

        res.status(201).json(relacao)
    } catch (error: any) {
        res.status(400).json({ erro: error.message })
    }
})

// Remove Responsável
router.delete("/:alunoId/responsavel/:usuarioId", checkToken, checkRoles([TIPO_USUARIO.ADMIN]), async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const alunoId = parseInt(req.params.alunoId)
        const usuarioId = parseInt(req.params.usuarioId)

        const service = new StudentService(schoolId)
        await service.removeResponsavel(alunoId, usuarioId)

        res.status(200).json({ mensagem: "Responsável removido com sucesso" })
    } catch (error: any) {
        res.status(400).json({ erro: error.message })
    }
})

// Gera relatório de mensalidades por turma
router.get("/relatorios/mensalidades-por-turma", checkToken, checkRoles([TIPO_USUARIO.ADMIN]), async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })
        
        const service = new StudentService(schoolId)
        const report = await service.getReportsByClass()

        res.status(200).json(report)
    } catch (error: any) {
        res.status(500).json({ erro: "Erro ao gerar relatório" })
    }
})

// Verifica se aluno possui registro de diário em uma data específica
router.get("/:alunoId/possui-registro-diario", checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const alunoId = parseInt(req.params.alunoId)
        if (isNaN(alunoId)) return res.status(400).json({ erro: "ID de aluno inválido" })

        const service = new StudentService(schoolId)
        const aluno = await service.findById(alunoId)
        if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado" })

        const dataConsulta = req.query.data ? req.query.data.toString() : new Date().toISOString()
        const dataFormatada = normalizarData(dataConsulta)
        const dataInicio = new Date(`${dataFormatada}T00:00:00.000Z`)
        const dataFim = new Date(`${dataFormatada}T23:59:59.999Z`)

        const diario = await prisma.diario.findFirst({
        where: { 
            alunoId,
            schoolId, // Filtra para garantir multi-tenancy
            data: {
            gte: dataInicio,
            lte: dataFim
            }
        }
        })

        res.status(200).json({ 
            alunoId, 
            data: dataFormatada,
            temDiario: !!diario,
            diario: diario ? { id: diario.id } : null
        })

    } catch (error) {
        console.error("Erro ao verificar diário:", error)
        res.status(400).json({ erro: "Erro ao verificar diário", detalhes: error })
    }
})

export default router
