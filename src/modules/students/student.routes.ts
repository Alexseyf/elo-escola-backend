import { Router } from 'express';
import { StudentController } from './student.controller';
const router = Router();
const controller = new StudentController();

router.get('/', controller.getAll.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/soft/:id', controller.delete.bind(controller));

export const studentsRouter = router;
