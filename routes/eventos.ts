import { Router, Request, Response } from "express"
import { checkToken } from '../src/shared/middlewares/checkToken'
import { checkRoles } from "../src/shared/middlewares/checkRoles"
import { createEventSchema, updateEventSchema } from "../schemas/event.schema"
import { EventService } from "../services/eventService"

const router = Router()

// Cria um novo evento
router.post("/", checkToken, checkRoles(["ADMIN", "PROFESSOR"]), async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId
    const criadorId = req.userLogadoId

    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })
    if (!criadorId) return res.status(401).json({ error: "Usuário não identificado" })

    const valida = createEventSchema.safeParse(req.body)
    if (!valida.success) {
      return res.status(400).json({ erro: valida.error })
    }

    const service = new EventService(schoolId)
    const evento = await service.create(valida.data, criadorId)

    return res.status(201).json(evento)
  } catch (error: any) {
    console.error("Erro ao criar evento:", error)
    return res.status(500).json({ erro: error.message || "Erro ao criar evento" })
  }
})

// Busca todos os eventos
router.get("/", checkToken, async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

    const { data, tipoEvento, turmaId, isAtivo } = req.query;
    
    const service = new EventService(schoolId)
    const eventos = await service.findAll({
        data: data as string,
        tipoEvento: tipoEvento as any,
        turmaId: turmaId ? parseInt(turmaId as string) : undefined,
        isAtivo: isAtivo !== undefined ? isAtivo === 'true' : undefined
    })

    return res.status(200).json(eventos)
  } catch (error: any) {
    console.error("Erro ao listar eventos:", error)
    return res.status(500).json({ erro: error.message || "Erro ao listar eventos" })
  }
})

// Busca todos os eventos de uma turma
router.get("/turma/:turmaId", checkToken, async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

    const turmaId = parseInt(req.params.turmaId)
    if (isNaN(turmaId)) return res.status(400).json({ erro: "ID da turma inválido" })

    const service = new EventService(schoolId)
    const eventos = await service.findByTurma(turmaId)

    return res.status(200).json(eventos)
  } catch (error: any) {
    return res.status(500).json({ erro: error.message || "Erro ao buscar eventos da turma" })
  }
})

// Busca um evento por ID
router.get("/:id", checkToken, async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ erro: "ID inválido" })

    const service = new EventService(schoolId)
    const evento = await service.findById(id)

    if (!evento) return res.status(404).json({ erro: "Evento não encontrado" })

    return res.status(200).json(evento)
  } catch (error: any) {
    return res.status(500).json({ erro: error.message })
  }
})

// Atualiza um evento
router.put("/:id", checkToken, checkRoles(["ADMIN", "PROFESSOR"]), async (req: Request, res: Response) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ erro: "ID inválido" })

        const valida = createEventSchema.safeParse(req.body) 
        if (!valida.success) return res.status(400).json({ erro: valida.error })

        const service = new EventService(schoolId)
        const evento = await service.update(id, valida.data)

        return res.status(200).json(evento)
    } catch (error: any) {
        return res.status(500).json({ erro: error.message })
    }
})

// Atualiza parcialmente um evento
router.patch("/:id", checkToken, checkRoles(["ADMIN", "PROFESSOR"]), async (req: Request, res: Response) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const id = parseInt(req.params.id)
        const valida = updateEventSchema.safeParse(req.body)
        if (!valida.success) return res.status(400).json({ erro: valida.error })

        const service = new EventService(schoolId)
        const evento = await service.update(id, valida.data)

        return res.status(200).json(evento)
    } catch (error: any) {
        return res.status(500).json({ erro: error.message })
    }
})

// Desativa um evento (Soft Delete)
router.delete("/:id", checkToken, checkRoles(["ADMIN", "PROFESSOR"]), async (req: Request, res: Response) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })
        const id = parseInt(req.params.id)

        const service = new EventService(schoolId)
        await service.delete(id)

        return res.status(200).json({ mensagem: "Evento desativado com sucesso" })
    } catch (error: any) {
        return res.status(500).json({ erro: error.message })
    }
})

export default router

