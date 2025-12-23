import express from 'express'
import routesUsuarios from './routes/usuarios'
import usuariosRouter from './routes/usuarios'
import turmasRouter from './routes/turmas'
import alunosRouter from './routes/alunos'
import professoresRouter from './routes/professores'
import responsaveisRouter from './routes/responsaveis'
import diariosRouter from './routes/diarios'
import cronogramasRouter from './routes/cronogramas'
import eventosRouter from './routes/eventos'
import atividadesRouter from './routes/atividades'
import routesLogin from './routes/login'
import routesRecuperaSenha from './routes/recuperaSenha'
import routesValidaSenha from './routes/validaSenha'
import campos from './routes/campos'
import objetivosRouter from './routes/objetivos'
import gruposRouter from './routes/grupos'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerDocs from './swagger.json'
import { tenantMiddleware } from './src/shared/middlewares/tenant.middleware' // Importa tenant middleware
import { platformRouter } from './src/modules/platform/platform.routes' // Rotas da plataforma para PLATFORM_ADMIN (não é necessário tenant context)

const app = express()
const port = 3000

// Adiciona 'x-tenant-id' aos allowedHeaders
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-tenant-id',
  ], 
  exposedHeaders: ['Authorization'],
  credentials: true, // Permitir cookies se necessário
}))

app.use(express.json())

// O login e a recuperação de senha podem funcionar inicialmente sem o tenant
// (O tenant pode ser resolvido APÓS o login, com base no schoolId do usuário)
app.use("/login", routesLogin)
app.use("/recupera-senha", routesRecuperaSenha)
app.use("/valida-senha", routesValidaSenha)


// Rotas para PLATFORM_ADMIN - exigem autenticação, mas não tenant context
// Permitem o gerenciamento global da plataforma (criação de escolas, visualização de todos os usuários, etc.)
app.use("/api/v1/platform", platformRouter)

// Documentação Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/', (req, res) => {
  res.send('API - Escola Educação Infantil')
})

// Garante que TODAS as rotas protegidas identifiquem o tenant (escola) corretamente
// Todas as rotas registradas APÓS este middleware exigirão:
// - Cabeçalho x-tenant-id válido OU
// - Subdomínio válido que corresponda a um slug da escola
app.use(tenantMiddleware);


// Todas as rotas abaixo deste ponto terão res.locals.schoolId disponível
app.use("/usuarios", routesUsuarios)
app.use('/usuarios', usuariosRouter)
app.use('/turmas', turmasRouter)
app.use('/alunos', alunosRouter)
app.use('/professores', professoresRouter)
app.use('/responsaveis', responsaveisRouter)
app.use('/diarios', diariosRouter)
app.use('/cronogramas', cronogramasRouter)
app.use('/eventos', eventosRouter)
app.use('/atividades', atividadesRouter)
app.use('/objetivos', objetivosRouter)
app.use('/grupos', gruposRouter)
app.use("/campos", campos)

// Middleware global de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  console.error('Stack:', err.stack)
  res.status(500).json({ 
    error: 'Algo deu errado!',
    details: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})


if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => {
    console.log(`Servidor rodando na porta ${port}`)
  })
}

export default app