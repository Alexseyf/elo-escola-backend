import { Router } from 'express';
import { SchoolController } from './school.controller';
import { checkRoles } from '../../shared/middlewares/checkRoles';
import { checkToken } from '../../shared/middlewares/checkToken';
import { TIPO_USUARIO } from '@prisma/client';

const router = Router();
const controller = new SchoolController();

router.post('/', checkToken, checkRoles([TIPO_USUARIO.PLATFORM_ADMIN]), controller.create.bind(controller));

export const schoolsRouter = router;
