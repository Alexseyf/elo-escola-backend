"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkToken_1 = require("../src/shared/middlewares/checkToken");
const checkRoles_1 = require("../src/shared/middlewares/checkRoles");
const schedule_schema_1 = require("../schemas/schedule.schema");
const scheduleService_1 = require("../services/scheduleService");
const router = (0, express_1.Router)();
// Cria um novo cronograma
router.post("/", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        const criadorId = req.userLogadoId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        if (!criadorId)
            return res.status(401).json({ error: "Usuário não identificado" });
        const valida = schedule_schema_1.createScheduleSchema.safeParse(req.body);
        if (!valida.success) {
            return res.status(400).json({ erro: valida.error });
        }
        const service = new scheduleService_1.ScheduleService(schoolId);
        const cronograma = await service.create(valida.data, criadorId);
        return res.status(201).json(cronograma);
    }
    catch (error) {
        console.error("Erro ao criar cronograma:", error);
        return res.status(500).json({ erro: error.message || "Erro ao criar cronograma" });
    }
});
// Lista todo o cronograma
router.get("/", checkToken_1.checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const { data, tipoEvento, isAtivo } = req.query;
        const service = new scheduleService_1.ScheduleService(schoolId);
        const result = await service.findAll({
            data: data,
            tipoEvento: tipoEvento,
            isAtivo: isAtivo !== undefined ? isAtivo === 'true' : undefined
        });
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Erro ao listar cronogramas:", error);
        return res.status(500).json({ erro: error.message || "Erro ao listar cronogramas" });
    }
});
// Busca um cronograma por ID
router.get("/:id", checkToken_1.checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const id = parseInt(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ erro: "ID inválido" });
        const service = new scheduleService_1.ScheduleService(schoolId);
        const cronograma = await service.findById(id);
        if (!cronograma)
            return res.status(404).json({ erro: "Cronograma não encontrado" });
        return res.status(200).json(cronograma);
    }
    catch (error) {
        console.error("Erro ao buscar cronograma:", error);
        return res.status(500).json({ erro: error.message || "Erro ao buscar cronograma" });
    }
});
// Atualiza um cronograma
router.put("/:id", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const id = parseInt(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ erro: "ID inválido" });
        const valida = schedule_schema_1.createScheduleSchema.safeParse(req.body);
        if (!valida.success)
            return res.status(400).json({ erro: valida.error });
        const service = new scheduleService_1.ScheduleService(schoolId);
        const cronograma = await service.update(id, valida.data);
        return res.status(200).json(cronograma);
    }
    catch (error) {
        return res.status(500).json({ erro: error.message });
    }
});
// Atualiza parcialmente um cronograma
router.patch("/:id", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN", "PROFESSOR"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const id = parseInt(req.params.id);
        const valida = schedule_schema_1.updateScheduleSchema.safeParse(req.body);
        if (!valida.success)
            return res.status(400).json({ erro: valida.error });
        const service = new scheduleService_1.ScheduleService(schoolId);
        const cronograma = await service.update(id, valida.data);
        return res.status(200).json(cronograma);
    }
    catch (error) {
        return res.status(500).json({ erro: error.message });
    }
});
// Desativa um cronograma (Soft Delete) **IMPLEMENTAR DELETE POSTERIORMENTE
router.delete("/:id", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const id = parseInt(req.params.id);
        const service = new scheduleService_1.ScheduleService(schoolId);
        await service.delete(id);
        return res.status(200).json({ mensagem: "Cronograma desativado com sucesso" });
    }
    catch (error) {
        console.error("Erro ao desativar cronograma:", error);
        return res.status(500).json({ erro: error.message });
    }
});
exports.default = router;
