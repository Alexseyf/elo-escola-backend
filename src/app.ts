import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { errorMiddleware } from './shared/middlewares/error.middleware';
import { tenantMiddleware } from './shared/middlewares/tenant.middleware';
import { AppError } from './shared/errors/AppError';

// Swagger documentation
import swaggerDocs from '../swagger.json';

// Rotas
import { studentsRouter } from './modules/students/student.routes';
import { schoolsRouter } from './modules/schools/school.routes';
import { authRouter } from './modules/auth/auth.routes';
import { turmasRouter } from './modules/turmas/turmas.routes';
import { platformRouter } from './modules/platform/platform.routes';

export const app = express();

// Middleware Global
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin', 'x-tenant-id'], 
  exposedHeaders: ['Authorization', 'Access-Control-Allow-Origin'],
}));
app.use(express.json());

// Rotas da plataforma (ANTES do middleware de tenant - sem contexto de tenant necessário)
app.use('/api/v1/platform', platformRouter);

// Documentação Swagger (pública - sem tenant context)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rota base e health check (públicas - sem tenant context)
app.get('/', (req, res) => {
  res.send({ 
    message: 'School SaaS API is Running' 
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// Multi-Tenant Middleware - Aplicado a rotas com escopo definido pelo tenant
app.use(tenantMiddleware);

// Rotas com escopo definido para o tenant (Requer tenant context)
app.use('/api/v1', authRouter); 
app.use('/api/v1/students', studentsRouter);
app.use('/api/v1/schools', schoolsRouter);
app.use('/api/v1/turmas', turmasRouter);

// Tratamento de 404
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Tratamento global de erros
app.use(errorMiddleware);
