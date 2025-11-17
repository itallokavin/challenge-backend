# Título do Seu Projeto

> Uma breve descrição de uma linha sobre o que este projeto faz.

Este guia irá ajudá-lo a configurar e executar o projeto em seu ambiente de desenvolvimento local. A aplicação NestJS rodará localmente, e o RabbitMQ rodará via Docker.

---

## Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas:

* **Node.js:** (v20 ou superior recomendado)
* **npm** (geralmente vem com o Node.js)
* **Docker:** (Necessário para executar o RabbitMQ)

---

## Configuração do Ambiente

Siga estes passos para deixar o projeto pronto para ser executado.

### 1. Instalar Dependências

Clone o repositório e instale todos os pacotes npm necessários:

```bash
npm install
```

### 2. Configurar o RabbitMQ

Para que a API funcione, ela precisa do RabbitMQ. Vamos subi-lo usando Docker.

Execute o seguinte comando no seu terminal. O `-d` o manterá rodando em segundo plano.

```bash
docker-compose up -d
```

> Você pode acessar a interface de admin do RabbitMQ em `http://localhost:15672` (login: `admin`, senha: `admin`).

### 3. Configurar Variáveis de Ambiente

O projeto precisa de um arquivo `.env` para armazenar segredos e configurações.

**a) Crie o arquivo `.env`**

Adicione este conteúdo ao seu arquivo `.env` e preencha os valores que faltam:

```.env
# Banco de Dados (SQLite)
DATABASE_URL='file:./dev.db'

# Autenticação JWT
JWT_SECRET=COLOQUE_SEU_SEGREDO_JWT_AQUI
JWT_EXPIRES_IN=1d
```

### 4. Preparar o Banco de Dados

Com o `.env` pronto, prepare o banco de dados Prisma:

```bash
# 1. Gera o cliente Prisma
npx prisma generate

# 2. Executa as migrações
npx prisma migrate deploy
```

### 5. Criar Diretório de Arquivos

Crie o diretório `files` (se ele for usado para uploads ou outros arquivos):

```bash
mkdir files
```

---

## Executando a Aplicação

Depois de todos os passos de configuração, inicie o servidor de desenvolvimento do NestJS:

```bash
npm run start
```

O Backend estará disponível em `http://localhost:3000`.