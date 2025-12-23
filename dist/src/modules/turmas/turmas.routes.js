"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turmasRouter = void 0;
const express_1 = require("express");
const turmas_service_1 = require("./turmas.service");
const router = (0, express_1.Router)();
exports.turmasRouter = router;
router.post('/', async (req, res, next) => {
    try {
        const schoolId = res.locals.schoolId;
        if (!schoolId)
            throw new Error("School ID missing");
        const service = new turmas_service_1.TurmasService(schoolId);
        const result = await service.create(req.body);
        res.status(201).json(result);
    }
    catch (err) {
        next(err);
    }
});
router.get('/', async (req, res, next) => {
    try {
        const schoolId = res.locals.schoolId;
        const service = new turmas_service_1.TurmasService(schoolId);
        const result = await service.findAll();
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.get('/totalAlunosTurma', async (req, res, next) => {
    try {
        const schoolId = res.locals.schoolId;
        const service = new turmas_service_1.TurmasService(schoolId);
        const result = await service.getTotalActiveStudents();
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const schoolId = res.locals.schoolId;
        const service = new turmas_service_1.TurmasService(schoolId);
        const result = await service.findById(Number(req.params.id));
        if (!result) {
            res.status(404).json({ message: 'Turma não encontrada' });
            return;
        }
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.post('/:id/professor', async (req, res, next) => {
    try {
        const schoolId = res.locals.schoolId;
        const service = new turmas_service_1.TurmasService(schoolId);
        const { usuarioId } = req.body;
        const result = await service.addProfessor(Number(req.params.id), Number(usuarioId));
        res.status(201).json(result);
    }
    catch (err) {
        next(err);
    }
});
