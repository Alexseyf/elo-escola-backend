"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkToken_1 = require("../src/shared/middlewares/checkToken");
const checkRoles_1 = require("../src/shared/middlewares/checkRoles");
const class_schema_1 = require("../schemas/class.schema");
const classService_1 = require("../services/classService");
const router = (0, express_1.Router)();
// Cria uma turma
router.post("/", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const valida = class_schema_1.createClassSchema.safeParse(req.body);
        if (!valida.success) {
            return res.status(400).json({ erro: "Nome de turma inválido", details: valida.error });
        }
        const service = new classService_1.ClassService(schoolId);
        const turma = await service.create(valida.data);
        res.status(201).json(turma);
    }
    catch (error) {
        if (error.message.includes('Grupo')) {
            res.status(400).json({ erro: "Erro de Configuração", details: error.message });
        }
        else {
            res.status(400).json({ erro: "Erro ao criar turma", details: error.message });
        }
    }
});
// Lista todas as turmas
router.get("/", checkToken_1.checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const service = new classService_1.ClassService(schoolId);
        const turmas = await service.findAll();
        res.status(200).json(turmas);
    }
    catch (error) {
        res.status(400).json({ erro: error.message });
    }
});
// Adiciona um professor a uma turma
router.post("/:usuarioId/professor", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const usuarioId = parseInt(req.params.usuarioId);
        if (isNaN(usuarioId))
            return res.status(400).json({ erro: "ID de usuário inválido" });
        const valida = class_schema_1.assignTeacherSchema.safeParse(req.body);
        if (!valida.success)
            return res.status(400).json({ erro: "Dados inválidos", details: valida.error });
        const service = new classService_1.ClassService(schoolId);
        const relation = await service.addProfessor(valida.data.turmaId, usuarioId);
        res.status(201).json(relation);
    }
    catch (error) {
        res.status(400).json({ erro: error.message });
    }
});
// Busca todos os alunos de uma turma
router.get("/:turmaId/alunos", checkToken_1.checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const turmaId = parseInt(req.params.turmaId);
        if (isNaN(turmaId))
            return res.status(400).json({ erro: "ID inválido" });
        const service = new classService_1.ClassService(schoolId);
        const turma = await service.findById(turmaId);
        if (!turma)
            return res.status(404).json({ erro: "Turma não encontrada" });
        res.status(200).json(turma.alunos);
    }
    catch (error) {
        res.status(400).json({ erro: error.message });
    }
});
// Busca o total de alunos ativos
router.get("/totalAlunosTurma", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const service = new classService_1.ClassService(schoolId);
        const result = await service.getTotalActiveStudents();
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ erro: error.message });
    }
});
exports.default = router;
