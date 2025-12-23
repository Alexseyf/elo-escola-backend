import { Router } from "express"
import { TIPO_USUARIO } from "@prisma/client"
import { checkToken } from '../src/shared/middlewares/checkToken'
import { checkRoles } from "../src/shared/middlewares/checkRoles"
import { UserService } from "../services/userService"
import { createUserSchema } from "../schemas/user.schema"

const router = Router()

// Cria um usuário
router.post("/", checkToken, checkRoles([TIPO_USUARIO.ADMIN, TIPO_USUARIO.PLATFORM_ADMIN]), async (req, res) => {
  try {
    const isPlatformAdmin = req.roles?.includes(TIPO_USUARIO.PLATFORM_ADMIN);
    
    let schoolId: string;
    
    if (isPlatformAdmin) {
      schoolId = req.body.schoolId;
      if (!schoolId) {
        return res.status(400).json({ 
          error: "PLATFORM_ADMIN deve fornecer 'schoolId' no body da requisição" 
        });
      }
      
      const { prisma } = await import('../src/lib/prisma');
      const schoolExists = await prisma.school.findUnique({
        where: { id: schoolId }
      });
      
      if (!schoolExists) {
        return res.status(404).json({ 
          error: `Escola com ID '${schoolId}' não encontrada` 
        });
      }
    } else {
      schoolId = req.schoolId!;
      if (!schoolId) {
        return res.status(400).json({ 
          error: "Contexto da escola não identificado" 
        });
      }
    }

    const { schoolId: _, ...bodyWithoutSchoolId } = req.body;
    const valida = createUserSchema.safeParse(bodyWithoutSchoolId);
    if (!valida.success) {
      return res.status(400).json({ erro: valida.error });
    }

    const userService = new UserService(schoolId);
    const newUser = await userService.create(valida.data);

    res.status(201).json(newUser);

  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    if (error.message === 'Email already registered for this school.') {
        return res.status(409).json({ erro: error.message });
    }
    res.status(400).json({ error: error.message || "Erro inesperado" });
  }
})

// Lista todos os usuários
router.get("/", checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const userService = new UserService(schoolId)
        const users = await userService.findAll()
        
        const formattedUsers = users.map(u => ({
            ...u,
            roles: u.roles.map(ur => ur.role.tipo)
        }))

        res.status(200).json(formattedUsers)
    } catch (error) {
        res.status(400).json(error)
    }
})

// Busca o usuário logado
router.get("/usuario-logado", checkToken, async (req, res) => {
    try {
      const schoolId = req.schoolId
      if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

      const userId = req.userLogadoId
      if (!userId) return res.status(401).json({ error: "Usuário não identificado" })
      
      const userService = new UserService(schoolId)
      const usuario = await userService.findById(userId)
  
      if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }
  
      const { senha, ...usuarioSemSenha } = usuario;
      const usuarioFormatado = {
        ...usuarioSemSenha,
        roles: usuario.roles.map(ur => ur.role.tipo)
      };
  
      res.status(200).json(usuarioFormatado);
    } catch (error) {
      console.error("Erro ao buscar usuário logado:", error);
      res.status(500).json({ erro: "Erro ao buscar dados do usuário" });
    }
});

// Busca um usuário por ID
router.get("/:usuarioId", checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId
        if (!schoolId) return res.status(400).json({ error: "Contexto da escola não identificado" })

        const usuarioId = parseInt(req.params.usuarioId);
        if (isNaN(usuarioId)) return res.status(400).json({ erro: "ID inválido" });

        const userService = new UserService(schoolId)
        const usuario = await userService.findById(usuarioId)

        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" })

        const { senha, ...usuarioSemSenha } = usuario;
        const usuarioFormatado = {
            ...usuarioSemSenha,
            roles: usuario.roles.map(ur => ur.role.tipo)
        };

        res.status(200).json(usuarioFormatado);

    } catch (error) {
        res.status(500).json({ erro: "Erro interno" })
    }
})

export default router
