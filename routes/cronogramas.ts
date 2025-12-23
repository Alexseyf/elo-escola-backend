import { Router, Request, Response } from "express"
import { checkToken } from '../src/shared/middlewares/checkToken'
import { checkRoles } from "../src/shared/middlewares/checkRoles"
import { createScheduleSchema, updateScheduleSchema } from "../schemas/schedule.schema"
import { ScheduleService } from "../services/scheduleService"

const router = Router()

// Cria um novo cronograma
router.post("/", checkToken, checkRoles(["ADMIN"]), async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId
    const criadorId = req.userLogadoId

    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })
    if (!criadorId) return res.status(401).json({ error: "Usuário não identificado" })

    const valida = createScheduleSchema.safeParse(req.body)
    if (!valida.success) {
      return res.status(400).json({ erro: valida.error })
    }

    const service = new ScheduleService(schoolId)
    const cronograma = await service.create(valida.data, criadorId)

    return res.status(201).json(cronograma)
  } catch (error: any) {
    console.error("Erro ao criar cronograma:", error)
    return res.status(500).json({ erro: error.message || "Erro ao criar cronograma" })
  }
})

// Lista todo o cronograma
router.get("/", checkToken, async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

    const { data, tipoEvento, isAtivo } = req.query;

    const service = new ScheduleService(schoolId)
    const result = await service.findAll({
        data: data as string,
        tipoEvento: tipoEvento as any,
        isAtivo: isAtivo !== undefined ? isAtivo === 'true' : undefined
    })

    return res.status(200).json(result)
  } catch (error: any) {
    console.error("Erro ao listar cronogramas:", error)
    return res.status(500).json({ erro: error.message || "Erro ao listar cronogramas" })
  }
})

// Busca um cronograma por ID
router.get("/:id", checkToken, async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ erro: "ID inválido" })

    const service = new ScheduleService(schoolId)
    const cronograma = await service.findById(id)

    if (!cronograma) return res.status(404).json({ erro: "Cronograma não encontrado" })

    return res.status(200).json(cronograma)
  } catch (error: any) {
    console.error("Erro ao buscar cronograma:", error)
    return res.status(500).json({ erro: error.message || "Erro ao buscar cronograma" })
  }
})

// Atualiza um cronograma
router.put("/:id", checkToken, checkRoles(["ADMIN"]), async (req: Request, res: Response) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ erro: "ID inválido" })

        const valida = createScheduleSchema.safeParse(req.body)
        if (!valida.success) return res.status(400).json({ erro: valida.error })

        const service = new ScheduleService(schoolId)
        const cronograma = await service.update(id, valida.data)

        return res.status(200).json(cronograma)
    } catch (error: any) {
        return res.status(500).json({ erro: error.message })
    }
})

// Atualiza parcialmente um cronograma
router.patch("/:id", checkToken, checkRoles(["ADMIN", "PROFESSOR"]), async (req: Request, res: Response) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })
        const id = parseInt(req.params.id)
        
        const valida = updateScheduleSchema.safeParse(req.body)
        if (!valida.success) return res.status(400).json({ erro: valida.error })

        const service = new ScheduleService(schoolId)
        const cronograma = await service.update(id, valida.data)

        return res.status(200).json(cronograma)
    } catch (error: any) {
        return res.status(500).json({ erro: error.message })
    }
})

// Desativa um cronograma (Soft Delete) **IMPLEMENTAR DELETE POSTERIORMENTE
router.delete("/:id", checkToken, checkRoles(["ADMIN"]), async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })
    const id = parseInt(req.params.id)

    const service = new ScheduleService(schoolId)
    await service.delete(id)

    return res.status(200).json({ mensagem: "Cronograma desativado com sucesso" })
  } catch (error: any) {
    console.error("Erro ao desativar cronograma:", error)
    return res.status(500).json({ erro: error.message })
  }
})

export default router

