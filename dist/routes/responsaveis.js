"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const checkToken_1 = require("../src/shared/middlewares/checkToken");
const checkRoles_1 = require("../src/shared/middlewares/checkRoles");
const responsavelService_1 = require("../services/responsavelService");
const router = (0, express_1.Router)();
// Busca todos os alunos de um responsável
router.get("/:responsavelId/alunos", checkToken_1.checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const responsavelId = parseInt(req.params.responsavelId);
        if (isNaN(responsavelId))
            return res.status(400).json({ erro: "ID inválido" });
        const service = new responsavelService_1.ResponsavelService(schoolId);
        const alunos = await service.getAlunosByResponsavel(responsavelId);
        res.status(200).json(alunos);
    }
    catch (error) {
        console.error("Erro ao buscar alunos do responsável:", error);
        if (error.message.includes("não encontrado") || error.message.includes("não pertence")) {
            return res.status(404).json({ erro: error.message });
        }
        res.status(500).json({ erro: error.message });
    }
});
// Busca todos os alunos do responsável logado
router.get("/meus-alunos", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)([client_1.TIPO_USUARIO.RESPONSAVEL]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        const responsavelId = req.userLogadoId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        if (!responsavelId)
            return res.status(401).json({ erro: "Usuário não identificado" });
        const service = new responsavelService_1.ResponsavelService(schoolId);
        const alunos = await service.getAlunosByResponsavel(responsavelId);
        res.status(200).json(alunos);
    }
    catch (error) {
        console.error("Erro ao buscar alunos do responsável logado:", error);
        res.status(500).json({ erro: error.message });
    }
});
exports.default = router;
