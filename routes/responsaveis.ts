import { Router } from "express"
import { TIPO_USUARIO } from "@prisma/client"
import { checkToken } from '../src/shared/middlewares/checkToken'
import { checkRoles } from "../src/shared/middlewares/checkRoles"
import { ResponsavelService } from "../services/responsavelService"

const router = Router()

// Busca todos os alunos de um responsável
router.get("/:responsavelId/alunos", checkToken, async (req, res) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

    const responsavelId = parseInt(req.params.responsavelId)
    if (isNaN(responsavelId)) return res.status(400).json({ erro: "ID inválido" })
    
    const service = new ResponsavelService(schoolId)
    const alunos = await service.getAlunosByResponsavel(responsavelId)
    
    res.status(200).json(alunos)
  } catch (error: any) {
    console.error("Erro ao buscar alunos do responsável:", error)
    if (error.message.includes("não encontrado") || error.message.includes("não pertence")) {
        return res.status(404).json({ erro: error.message })
    }
    res.status(500).json({ erro: error.message })
  }
})

// Busca todos os alunos do responsável logado
router.get("/meus-alunos", checkToken, checkRoles([TIPO_USUARIO.RESPONSAVEL]), async (req, res) => {
  try {
    const schoolId = req.schoolId
    const responsavelId = req.userLogadoId

    if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })
    if (!responsavelId) return res.status(401).json({ erro: "Usuário não identificado" })

    const service = new ResponsavelService(schoolId)
    const alunos = await service.getAlunosByResponsavel(responsavelId)
    
    res.status(200).json(alunos)
  } catch (error: any) {
    console.error("Erro ao buscar alunos do responsável logado:", error)
    res.status(500).json({ erro: error.message })
  }
})

export default router

