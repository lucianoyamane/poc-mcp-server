# Gateway HTTP para Servidor MCP

Este é o gateway HTTP que permite integração web com o servidor MCP de jogos de cartas.

## Funcionalidades

- **API REST** para comunicação com front-end
- **Gerenciamento de sessões** de chat
- **Integração com servidor MCP** via STDIO
- **Processamento de linguagem natural** com Claude
- **Suporte a tools, resources e prompts** do MCP

## Instalação

```bash
cd gateway
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto (mesmo do servidor MCP):

```env
ANTHROPIC_API_KEY=sua_chave_api_aqui
GATEWAY_PORT=3001
```

## Execução

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

O gateway estará disponível em `http://localhost:3001`

## Endpoints da API

### Chat

- `POST /api/chat/session` - Criar nova sessão de chat
- `POST /api/chat/message` - Enviar mensagem
- `GET /api/chat/history/:sessionId` - Obter histórico

### MCP Resources

- `GET /api/resources` - Listar resources disponíveis
- `POST /api/resources/read` - Ler resource específico

### MCP Prompts

- `GET /api/prompts` - Listar prompts disponíveis
- `POST /api/prompts/execute` - Executar prompt

### Sistema

- `GET /api/health` - Health check

## Exemplo de Uso

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

### 2. Listar Tools Disponíveis
```bash
curl http://localhost:3001/api/tools
```

### 3. Criar sessão
```bash
curl -X POST http://localhost:3001/api/chat/session
```

### 4. Enviar mensagem
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_123",
    "message": "Crie um baralho novo"
  }'
```

### 5. Listar resources
```bash
curl http://localhost:3001/api/resources
```

### 6. Listar prompts
```bash
curl http://localhost:3001/api/prompts
```

## Inspector MCP

Para debugar e inspecionar o servidor MCP diretamente:

```bash
cd gateway
node inspector.js
```

O inspector vai:
- Listar todas as tools disponíveis com seus schemas
- Listar todos os resources disponíveis
- Listar todos os prompts disponíveis
- Testar uma tool (criar_baralho)
- Testar um prompt (explicar-regras)

## Arquitetura

```
Front-end (React) ←→ Gateway HTTP (Express) ←→ Servidor MCP (STDIO)
```

O gateway:
1. Recebe requisições HTTP do front-end
2. Conecta-se ao servidor MCP via STDIO
3. Processa mensagens com Claude
4. Executa tools/resources/prompts conforme necessário
5. Retorna respostas para o front-end

## Sessões

- Cada sessão mantém histórico de mensagens
- Sessões expiram após 30 minutos de inatividade
- Armazenamento em memória (para produção, use Redis/DB)

## Próximos Passos

1. Implementar autenticação JWT
2. Adicionar persistência de sessões
3. Implementar WebSocket para chat em tempo real
4. Adicionar rate limiting
5. Implementar logs estruturados 