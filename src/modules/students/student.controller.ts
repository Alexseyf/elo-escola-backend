import { Request, Response, NextFunction } from 'express';
import { StudentService } from './student.service';
import { createStudentSchema, updateStudentSchema } from './student.schema';

export class StudentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = res.locals;
      const data = createStudentSchema.parse(req.body); 
      
      const service = new StudentService(schoolId);
      const student = await service.create(data);
      
      res.status(201).json(student);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = res.locals;
      const onlyActive = req.query.active === 'true';
      
      const service = new StudentService(schoolId);
      const students = await service.findAll(onlyActive);
      
      res.status(200).json(students);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = res.locals;
      const id = Number(req.params.id);
      
      const service = new StudentService(schoolId);
      const student = await service.findById(id);
      
      if (!student) {
         res.status(404).json({ message: 'Student not found' });
         return;
      }
      
      res.status(200).json(student);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = res.locals;
      const id = Number(req.params.id);
      const data = updateStudentSchema.parse(req.body);
      
      const service = new StudentService(schoolId);
      const student = await service.update(id, data);
      
      res.status(200).json(student);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = res.locals;
      const id = Number(req.params.id);
      
      const service = new StudentService(schoolId);
      await service.softDelete(id);
      
      res.status(200).json({ message: 'Student deactivated' });
    } catch (error) {
      next(error);
    }
  }
}
