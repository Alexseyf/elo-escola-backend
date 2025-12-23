"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolController = void 0;
const school_service_1 = require("./school.service");
const school_schema_1 = require("./school.schema");
class SchoolController {
    async create(req, res, next) {
        try {
            const data = school_schema_1.createSchoolSchema.parse(req.body);
            const service = new school_service_1.SchoolService();
            const result = await service.createSchool(data);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SchoolController = SchoolController;
