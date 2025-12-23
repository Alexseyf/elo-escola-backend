import { Router, Request, Response } from "express"
import { TIPO_USUARIO } from "@prisma/client"
import { checkToken } from '../src/shared/middlewares/checkToken'
import { checkRoles } from "../src/shared/middlewares/checkRoles"
import { createDiarioSchema } from "../schemas/diario.schema"
import { DiarioService } from "../services/diarioService"
import { ResponsavelAlunoService } from "../services/responsavelAlunoService"

const router = Router()

// Cria um novo diário
router.post("/", checkToken, checkRoles(["ADMIN", "PROFESSOR"]), async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

    const valida = createDiarioSchema.safeParse(req.body)
    if (!valida.success) {
      return res.status(400).json({ erro: valida.error })
    }

    const service = new DiarioService(schoolId)
    const diario = await service.create(valida.data)

    res.status(201).json(diario)
  } catch (error: any) {
    console.error("Erro ao criar diário:", error)
    return res.status(500).json({ erro: error.message || "Erro ao criar diário" })
  }
})

// Busca todos os diários de um aluno
router.get("/aluno/:alunoId", checkToken, async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId
    const roles = req.roles as string[] | undefined
    const userId = req.userLogadoId

    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

    const alunoId = parseInt(req.params.alunoId);
    if (isNaN(alunoId)) return res.status(400).json({ erro: "ID de aluno inválido" });

    if (roles?.includes(TIPO_USUARIO.RESPONSAVEL)) {
        if (!userId) return res.status(401).json({ erro: "Usuário invalido" })
        
        const responsavelService = new ResponsavelAlunoService(schoolId)
        const temAcesso = await responsavelService.checkAccess(userId, alunoId)
        
        if (!temAcesso) {
            return res.status(403).json({ 
                erro: "Acesso negado. Você não tem permissão para visualizar diários deste aluno." 
            })
        }
    }

    const service = new DiarioService(schoolId)
    const diarios = await service.findAllByAluno(alunoId)

    res.status(200).json(diarios)
  } catch (error: any) {
    console.error("Erro ao buscar diários:", error);
    res.status(400).json({ erro: error.message || "Erro ao buscar diários" });
  }
})

// Busca um diário por ID
router.get("/:id", checkToken, async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId
    const roles = req.roles as string[] | undefined
    const userId = req.userLogadoId

    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

    const diarioId = parseInt(req.params.id);
    if (isNaN(diarioId)) return res.status(400).json({ erro: "ID inválido" });

    const service = new DiarioService(schoolId)
    const diario = await service.findById(diarioId)

    if (!diario) return res.status(404).json({ erro: "Diário não encontrado" })

    if (roles?.includes(TIPO_USUARIO.RESPONSAVEL)) {
        if (!userId) return res.status(401).json({ erro: "Usuário invalido" })
        
        const responsavelService = new ResponsavelAlunoService(schoolId)
        const temAcesso = await responsavelService.checkAccess(userId, diario.alunoId)
        
        if (!temAcesso) {
            return res.status(403).json({ 
                erro: "Acesso negado. Você não tem permissão para visualizar este diário." 
            })
        }
    }

    res.status(200).json(diario)
  } catch (error: any) {
    res.status(500).json({ erro: error.message })
  }
})

// Atualiza um diário
router.put("/:id", checkToken, checkRoles(["ADMIN", "PROFESSOR"]), async (req: Request, res: Response) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const diarioId = parseInt(req.params.id);
        if (isNaN(diarioId)) return res.status(400).json({ erro: "ID inválido" });

        const valida = createDiarioSchema.safeParse(req.body)
        if (!valida.success) return res.status(400).json({ erro: valida.error })

        const service = new DiarioService(schoolId)
        const diario = await service.update(diarioId, valida.data)

        res.status(200).json(diario)
    } catch (error: any) {
        res.status(500).json({ erro: error.message })
    }
})

// Atualiza parcialmente um diário
router.patch("/:id", checkToken, checkRoles(["ADMIN", "PROFESSOR"]), async (req: Request, res: Response) => {
     try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const diarioId = parseInt(req.params.id);
        if (isNaN(diarioId)) return res.status(400).json({ erro: "ID inválido" });

        const valida = createDiarioSchema.safeParse(req.body)
        if (!valida.success) return res.status(400).json({ erro: valida.error })

        const service = new DiarioService(schoolId)
        const diario = await service.update(diarioId, valida.data)

        res.status(200).json(diario)
    } catch (error: any) {
        res.status(500).json({ erro: error.message })
    }
})

export default router
