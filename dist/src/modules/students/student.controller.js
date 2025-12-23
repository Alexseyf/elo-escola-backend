"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const student_service_1 = require("./student.service");
const student_schema_1 = require("./student.schema");
class StudentController {
    async create(req, res, next) {
        try {
            const { schoolId } = res.locals;
            const data = student_schema_1.createStudentSchema.parse(req.body);
            const service = new student_service_1.StudentService(schoolId);
            const student = await service.create(data);
            res.status(201).json(student);
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const { schoolId } = res.locals;
            const onlyActive = req.query.active === 'true';
            const service = new student_service_1.StudentService(schoolId);
            const students = await service.findAll(onlyActive);
            res.status(200).json(students);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { schoolId } = res.locals;
            const id = Number(req.params.id);
            const service = new student_service_1.StudentService(schoolId);
            const student = await service.findById(id);
            if (!student) {
                res.status(404).json({ message: 'Student not found' });
                return;
            }
            res.status(200).json(student);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { schoolId } = res.locals;
            const id = Number(req.params.id);
            const data = student_schema_1.updateStudentSchema.parse(req.body);
            const service = new student_service_1.StudentService(schoolId);
            const student = await service.update(id, data);
            res.status(200).json(student);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { schoolId } = res.locals;
            const id = Number(req.params.id);
            const service = new student_service_1.StudentService(schoolId);
            await service.softDelete(id);
            res.status(200).json({ message: 'Student deactivated' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.StudentController = StudentController;
