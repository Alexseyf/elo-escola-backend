import { Request, Response, NextFunction } from 'express';
import { SchoolService } from './school.service';
import { createSchoolSchema } from './school.schema';

export class SchoolController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSchoolSchema.parse(req.body);

      const service = new SchoolService();
      const result = await service.createSchool(data);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}
