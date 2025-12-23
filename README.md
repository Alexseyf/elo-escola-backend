# Elo API - Plataforma Escolar SaaS

## 🌟 Sobre o Projeto
API robusta e escalável desenvolvida para uma **Plataforma de Gestão Escolar Multi-tenant (SaaS)**. O sistema permite que múltiplas escolas utilizem a mesma infraestrutura de forma isolada e segura, oferecendo ferramentas completas para a administração pedagógica e acadêmica.

A API adota uma arquitetura modular e utiliza **controle de tenância via Header (`x-tenant-id`) ou Subdomínio**, garantindo que os dados de cada escola permaneçam estritamente segregados.

---

## 🚀 Principais Funcionalidades

### 🏢 Arquitetura Multi-Tenant
- **Isolamento de Dados:** Contexto definido automaticamente por requisição.
- **Gestão de Plataforma:** Módulo exclusivo para administradores da plataforma (super-admins) gerenciarem escolas e métricas globais.

### 📚 Módulos Acadêmicos
- **Gestão de Alunos:** Cadastros completos, vínculo com responsáveis e relatórios.
- **Turmas:** Organização de classes, vínculo de professores e alunos.
- **Diários de Classe:** Registro de atividades diárias, observações e ocorrências.
- **Cronogramas e Eventos:** Calendário escolar e rotinas das turmas.
- **Atividades Pedagógicas:** Planejamento alinhado aos **Objetivos de Aprendizagem e Desenvolvimento (BNCC)**.
- **Campos de Experiência:** Estrutura curricular baseada na BNCC.

### 👥 Gestão de Usuários e Acesso
- **Autenticação:** JWT (JSON Web Token) com expiração segura.
- **Controle de Acesso (RBAC):** Perfis distintos para `PLATFORM_ADMIN`, `ADMIN`, `PROFESSOR` e `RESPONSAVEL`.
- **Soft Delete:** Preservação de histórico com desativação lógica de registros.

---

## 🛠️ Tecnologias Utilizadas
- **Runtime:** Node.js
- **Linguagem:** TypeScript
- **Framework:** Express.js
- **Banco de Dados:** PostgreSQL (via Prisma ORM)
- **Documentação:** Swagger / OpenAPI 3.0
- **Segurança:** Bcrypt, JWT, CORS
- **Utilitários:** Zod (Validação), Nodemailer (E-mails)

---

## ⚙️ Configuração e Instalação

### Pré-requisitos
- Node.js (v16+)
- PostgreSQL
- Gerenciador de pacotes (npm ou yarn)

### 1. Instalação
```bash
# Instale as dependências
npm install
```

### 2. Configuração de Ambiente
Crie um arquivo `.env` na raiz do projeto configurando as variáveis necessárias (consulte `.env.example`):

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/elo_db"
JWT_KEY="sua_chave_secreta_jwt"
ALLOWED_ORIGINS="http://localhost:3000,https://seuapp.com"
```

### 3. Banco de Dados
Execute as migrações para criar as tabelas no banco de dados:
```bash
npx prisma migrate dev
```

### 4. Execução
```bash
# Modo de Desenvolvimento
npm run dev

# Modo de Produção
npm run build
npm start
```

---

## 📖 Documentação da API
A API possui documentação completa e interativa via Swagger.

- **Local:** `http://localhost:3000/api-docs`
- **Produção:** Disponível na rota `/api-docs` do domínio implantado.

> **Nota:** Para testar endpoints protegidos no Swagger, lembre-se de informar o header `x-tenant-id` com o slug da escola desejada (ex: `escola-modelo`), além do Token Bearer.

---

## 🚀 Implantação
O projeto está otimizado para deploy na **Vercel** ou containers Docker.
- Script de build para Vercel: `npm run vercel-build`

---

## 📞 Contato
**Mantenedor:** Alexandre Seyffert
**Email:** alexseyf66@gmail.com
