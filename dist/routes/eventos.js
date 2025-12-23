"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkToken_1 = require("../src/shared/middlewares/checkToken");
const checkRoles_1 = require("../src/shared/middlewares/checkRoles");
const event_schema_1 = require("../schemas/event.schema");
const eventService_1 = require("../services/eventService");
const router = (0, express_1.Router)();
// Cria um novo evento
router.post("/", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN", "PROFESSOR"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        const criadorId = req.userLogadoId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        if (!criadorId)
            return res.status(401).json({ error: "Usuário não identificado" });
        const valida = event_schema_1.createEventSchema.safeParse(req.body);
        if (!valida.success) {
            return res.status(400).json({ erro: valida.error });
        }
        const service = new eventService_1.EventService(schoolId);
        const evento = await service.create(valida.data, criadorId);
        return res.status(201).json(evento);
    }
    catch (error) {
        console.error("Erro ao criar evento:", error);
        return res.status(500).json({ erro: error.message || "Erro ao criar evento" });
    }
});
// Busca todos os eventos
router.get("/", checkToken_1.checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const { data, tipoEvento, turmaId, isAtivo } = req.query;
        const service = new eventService_1.EventService(schoolId);
        const eventos = await service.findAll({
            data: data,
            tipoEvento: tipoEvento,
            turmaId: turmaId ? parseInt(turmaId) : undefined,
            isAtivo: isAtivo !== undefined ? isAtivo === 'true' : undefined
        });
        return res.status(200).json(eventos);
    }
    catch (error) {
        console.error("Erro ao listar eventos:", error);
        return res.status(500).json({ erro: error.message || "Erro ao listar eventos" });
    }
});
// Busca todos os eventos de uma turma
router.get("/turma/:turmaId", checkToken_1.checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const turmaId = parseInt(req.params.turmaId);
        if (isNaN(turmaId))
            return res.status(400).json({ erro: "ID da turma inválido" });
        const service = new eventService_1.EventService(schoolId);
        const eventos = await service.findByTurma(turmaId);
        return res.status(200).json(eventos);
    }
    catch (error) {
        return res.status(500).json({ erro: error.message || "Erro ao buscar eventos da turma" });
    }
});
// Busca um evento por ID
router.get("/:id", checkToken_1.checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const id = parseInt(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ erro: "ID inválido" });
        const service = new eventService_1.EventService(schoolId);
        const evento = await service.findById(id);
        if (!evento)
            return res.status(404).json({ erro: "Evento não encontrado" });
        return res.status(200).json(evento);
    }
    catch (error) {
        return res.status(500).json({ erro: error.message });
    }
});
// Atualiza um evento
router.put("/:id", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN", "PROFESSOR"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const id = parseInt(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ erro: "ID inválido" });
        const valida = event_schema_1.createEventSchema.safeParse(req.body);
        if (!valida.success)
            return res.status(400).json({ erro: valida.error });
        const service = new eventService_1.EventService(schoolId);
        const evento = await service.update(id, valida.data);
        return res.status(200).json(evento);
    }
    catch (error) {
        return res.status(500).json({ erro: error.message });
    }
});
// Atualiza parcialmente um evento
router.patch("/:id", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN", "PROFESSOR"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const id = parseInt(req.params.id);
        const valida = event_schema_1.updateEventSchema.safeParse(req.body);
        if (!valida.success)
            return res.status(400).json({ erro: valida.error });
        const service = new eventService_1.EventService(schoolId);
        const evento = await service.update(id, valida.data);
        return res.status(200).json(evento);
    }
    catch (error) {
        return res.status(500).json({ erro: error.message });
    }
});
// Desativa um evento (Soft Delete)
router.delete("/:id", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN", "PROFESSOR"]), async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const id = parseInt(req.params.id);
        const service = new eventService_1.EventService(schoolId);
        await service.delete(id);
        return res.status(200).json({ mensagem: "Evento desativado com sucesso" });
    }
    catch (error) {
        return res.status(500).json({ erro: error.message });
    }
});
exports.default = router;
