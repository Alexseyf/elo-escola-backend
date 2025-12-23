"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const checkToken_1 = require("../src/shared/middlewares/checkToken");
const checkRoles_1 = require("../src/shared/middlewares/checkRoles");
const diario_schema_1 = require("../schemas/diario.schema");
const diarioService_1 = require("../services/diarioService");
const responsavelAlunoService_1 = require("../services/responsavelAlunoService");
const router = (0, express_1.Router)();
// Cria um novo diário
router.post("/", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN", "PROFESSOR"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const valida = diario_schema_1.createDiarioSchema.safeParse(req.body);
        if (!valida.success) {
            return res.status(400).json({ erro: valida.error });
        }
        const service = new diarioService_1.DiarioService(schoolId);
        const diario = await service.create(valida.data);
        res.status(201).json(diario);
    }
    catch (error) {
        console.error("Erro ao criar diário:", error);
        return res.status(500).json({ erro: error.message || "Erro ao criar diário" });
    }
});
// Busca todos os diários de um aluno
router.get("/aluno/:alunoId", checkToken_1.checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId;
        const roles = req.roles;
        const userId = req.userLogadoId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const alunoId = parseInt(req.params.alunoId);
        if (isNaN(alunoId))
            return res.status(400).json({ erro: "ID de aluno inválido" });
        if (roles?.includes(client_1.TIPO_USUARIO.RESPONSAVEL)) {
            if (!userId)
                return res.status(401).json({ erro: "Usuário invalido" });
            const responsavelService = new responsavelAlunoService_1.ResponsavelAlunoService(schoolId);
            const temAcesso = await responsavelService.checkAccess(userId, alunoId);
            if (!temAcesso) {
                return res.status(403).json({
                    erro: "Acesso negado. Você não tem permissão para visualizar diários deste aluno."
                });
            }
        }
        const service = new diarioService_1.DiarioService(schoolId);
        const diarios = await service.findAllByAluno(alunoId);
        res.status(200).json(diarios);
    }
    catch (error) {
        console.error("Erro ao buscar diários:", error);
        res.status(400).json({ erro: error.message || "Erro ao buscar diários" });
    }
});
// Busca um diário por ID
router.get("/:id", checkToken_1.checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId;
        const roles = req.roles;
        const userId = req.userLogadoId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const diarioId = parseInt(req.params.id);
        if (isNaN(diarioId))
            return res.status(400).json({ erro: "ID inválido" });
        const service = new diarioService_1.DiarioService(schoolId);
        const diario = await service.findById(diarioId);
        if (!diario)
            return res.status(404).json({ erro: "Diário não encontrado" });
        if (roles?.includes(client_1.TIPO_USUARIO.RESPONSAVEL)) {
            if (!userId)
                return res.status(401).json({ erro: "Usuário invalido" });
            const responsavelService = new responsavelAlunoService_1.ResponsavelAlunoService(schoolId);
            const temAcesso = await responsavelService.checkAccess(userId, diario.alunoId);
            if (!temAcesso) {
                return res.status(403).json({
                    erro: "Acesso negado. Você não tem permissão para visualizar este diário."
                });
            }
        }
        res.status(200).json(diario);
    }
    catch (error) {
        res.status(500).json({ erro: error.message });
    }
});
// Atualiza um diário
router.put("/:id", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN", "PROFESSOR"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const diarioId = parseInt(req.params.id);
        if (isNaN(diarioId))
            return res.status(400).json({ erro: "ID inválido" });
        const valida = diario_schema_1.createDiarioSchema.safeParse(req.body);
        if (!valida.success)
            return res.status(400).json({ erro: valida.error });
        const service = new diarioService_1.DiarioService(schoolId);
        const diario = await service.update(diarioId, valida.data);
        res.status(200).json(diario);
    }
    catch (error) {
        res.status(500).json({ erro: error.message });
    }
});
// Atualiza parcialmente um diário
router.patch("/:id", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN", "PROFESSOR"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const diarioId = parseInt(req.params.id);
        if (isNaN(diarioId))
            return res.status(400).json({ erro: "ID inválido" });
        const valida = diario_schema_1.createDiarioSchema.safeParse(req.body);
        if (!valida.success)
            return res.status(400).json({ erro: valida.error });
        const service = new diarioService_1.DiarioService(schoolId);
        const diario = await service.update(diarioId, valida.data);
        res.status(200).json(diario);
    }
    catch (error) {
        res.status(500).json({ erro: error.message });
    }
});
exports.default = router;
